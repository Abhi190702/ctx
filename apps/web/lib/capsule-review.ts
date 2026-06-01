import { estimateTokens, safeJsonParseArray } from "@ctx/core";

type ReviewDraft = {
  title?: string | null;
  summary?: string | null;
  rawText?: string | null;
  markdown?: string | null;
  sourceUrl?: string | null;
  tags?: string[] | string | null;
  nextSteps?: string[] | string | null;
  goals?: string[] | string | null;
  decisions?: string[] | string | null;
  projectName?: string | null;
  platform?: string | null;
};

type ExistingCapsule = {
  id: string;
  title?: string | null;
  summary?: string | null;
  rawText?: string | null;
  sourceUrl?: string | null;
  tags?: string[] | string | null;
  project?: { name?: string | null } | null;
};

export type CapsuleReview = {
  qualityScore: number;
  warnings: string[];
  strengths: string[];
  duplicateCandidates: Array<{
    id: string;
    title: string;
    reason: string;
    score: number;
  }>;
};

export function buildCapsuleReview(draft: ReviewDraft, existingCapsules: ExistingCapsule[] = []): CapsuleReview {
  const tags = listText(draft.tags);
  const nextSteps = listText(draft.nextSteps);
  const goals = listText(draft.goals);
  const decisions = listText(draft.decisions);
  const sourceUrl = draft.sourceUrl?.trim() ?? "";
  const rawText = draft.rawText?.trim() ?? "";
  const markdown = draft.markdown?.trim() ?? "";
  const tokenEstimate = estimateTokens([draft.summary, rawText, markdown].filter(Boolean).join("\n"));

  const checks = [
    { ok: Boolean(draft.title?.trim()), warning: "Add a clear title before saving." },
    { ok: Boolean(draft.summary?.trim()) && (draft.summary?.trim().length ?? 0) >= 40, warning: "Summary is too thin for reliable reuse." },
    { ok: tags.length >= 2, warning: "Add at least two tags so search and project recall work better." },
    { ok: goals.length > 0 || decisions.length > 0 || nextSteps.length > 0, warning: "Capture at least one goal, decision, or next step." },
    { ok: Boolean(sourceUrl) || rawText.length >= 240, warning: "Add a source URL or enough raw context to make the capsule auditable." }
  ];

  const warnings = checks.filter((check) => !check.ok).map((check) => check.warning);
  if (tokenEstimate > 2500) warnings.push("This capsule is heavy; trim raw text if you plan to drop it often.");
  if (rawText.length < 120) warnings.push("Raw context is very short; verify the generated memory did not miss details.");

  const strengths = [
    draft.summary?.trim() ? "Reusable summary is present." : "",
    tags.length ? `${tags.length} search tag${tags.length === 1 ? "" : "s"} ready.` : "",
    nextSteps.length ? "Next action context is captured." : "",
    sourceUrl ? "Source URL is attached." : "",
    draft.projectName?.trim() ? "Project grouping is set." : ""
  ].filter(Boolean);

  const duplicateCandidates = existingCapsules
    .map((capsule) => scoreDuplicateCandidate(draft, capsule))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const qualityScore = Math.max(0, Math.min(100, Math.round((checks.filter((check) => check.ok).length / checks.length) * 100 - Math.min(warnings.length - checks.filter((check) => !check.ok).length, 2) * 8)));

  return {
    qualityScore,
    warnings,
    strengths,
    duplicateCandidates
  };
}

function scoreDuplicateCandidate(draft: ReviewDraft, capsule: ExistingCapsule) {
  let score = 0;
  const reasons: string[] = [];
  const draftTitle = normalize(draft.title);
  const capsuleTitle = normalize(capsule.title);
  const draftSource = draft.sourceUrl?.trim();
  const capsuleSource = capsule.sourceUrl?.trim();

  if (draftSource && capsuleSource && draftSource === capsuleSource) {
    score += 70;
    reasons.push("same source");
  }

  if (draftTitle && capsuleTitle) {
    if (draftTitle === capsuleTitle) {
      score += 55;
      reasons.push("same title");
    } else {
      const overlap = overlapRatio(tokenize(draftTitle), tokenize(capsuleTitle));
      if (overlap >= 0.5) {
        score += Math.round(overlap * 34);
        reasons.push("similar title");
      }
    }
  }

  const tagOverlap = overlapRatio(listText(draft.tags), listText(capsule.tags));
  if (tagOverlap >= 0.35) {
    score += Math.round(tagOverlap * 24);
    reasons.push("shared tags");
  }

  const rawOverlap = overlapRatio(tokenize(draft.rawText ?? "").slice(0, 80), tokenize(capsule.rawText ?? "").slice(0, 80));
  if (rawOverlap >= 0.45) {
    score += Math.round(rawOverlap * 26);
    reasons.push("similar context");
  }

  if (score < 45) return null;
  return {
    id: capsule.id,
    title: capsule.title?.trim() || "Untitled Capsule",
    reason: reasons.join(", "),
    score: Math.min(score, 100)
  };
}

function listText(value: ReviewDraft["tags"]) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  if (!value) return [];
  const parsed = safeJsonParseArray(value);
  if (parsed.length) return parsed.map((item) => item.toLowerCase());
  return value
    .split(/[,#\n]/g)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalize(value: string | null | undefined) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ?? "";
}

function tokenize(value: string) {
  return normalize(value).match(/[a-z0-9]+/g) ?? [];
}

function overlapRatio(source: string[], target: string[]) {
  const left = new Set(source.filter((item) => item.length > 2));
  const right = new Set(target.filter((item) => item.length > 2));
  if (!left.size || !right.size) return 0;
  const shared = [...left].filter((item) => right.has(item)).length;
  return shared / Math.min(left.size, right.size);
}
