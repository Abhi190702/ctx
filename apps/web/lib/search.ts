import { safeJsonParseArray } from "@ctx/core";
import { prisma } from "./db";

type SearchableCapsule = {
  title?: string | null;
  description?: string | null;
  summary?: string | null;
  rawText?: string | null;
  markdown?: string | null;
  platform?: string | null;
  sourceUrl?: string | null;
  tags?: string | string[] | null;
  project?: { name?: string | null } | null;
};

const semanticAliases: Record<string, string[]> = {
  ai: ["chatgpt", "claude", "gemini", "cursor", "assistant", "agent"],
  agent: ["assistant", "cursor", "codex", "automation"],
  bug: ["error", "failed", "failure", "fix", "debug", "issue", "exception"],
  capture: ["generate", "save", "import", "clip", "selection"],
  chrome: ["extension", "browser", "plugin"],
  ci: ["actions", "workflow", "build", "test", "pipeline"],
  code: ["coding", "developer", "repo", "repository", "implementation"],
  drop: ["inject", "insert", "prompt", "reuse"],
  extension: ["chrome", "browser", "plugin", "toolbar"],
  github: ["git", "repo", "repository", "pull", "pr", "issue", "commit", "review"],
  import: ["upload", "file", "paste", "conversation", "export"],
  memory: ["capsule", "context", "handoff", "notes", "knowledge"],
  pr: ["pull", "review", "github", "thread", "comment"],
  project: ["workspace", "repo", "repository", "app"],
  search: ["find", "retrieve", "lookup", "semantic"],
  summary: ["summarize", "recap", "brief", "handoff"]
};

const stopWords = new Set(["a", "an", "and", "are", "for", "from", "how", "in", "is", "it", "of", "on", "or", "the", "to", "what", "with"]);

export async function searchCapsules(query: string) {
  const results = await searchCapsulesWithScores(query);
  return results.map(({ capsule }) => capsule);
}

export async function searchCapsulesWithScores(query: string) {
  const q = query.trim().toLowerCase();
  const capsules = await prisma.capsule.findMany({
    where: { status: "active" },
    include: { project: true, versions: true },
    orderBy: { updatedAt: "desc" }
  });

  if (!q) return capsules.map((capsule) => ({ capsule, score: 1 }));

  return capsules
    .map((capsule) => ({ capsule, score: scoreCapsuleForSearch(capsule, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function getRelatedCapsules(capsule: SearchableCapsule & { id: string }, limit = 4) {
  const capsules = await prisma.capsule.findMany({
    where: { id: { not: capsule.id }, status: "active" },
    include: { project: true, versions: true },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return capsules
    .map((candidate) => ({ capsule: candidate, score: scoreRelatedCapsule(capsule, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ capsule }) => capsule);
}

export function scoreCapsuleForSearch(capsule: SearchableCapsule, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 1;

  const terms = expandTerms(tokenize(q));
  if (!terms.length) return 0;

  const fields = [
    { value: capsule.title, weight: 12 },
    { value: capsule.project?.name, weight: 10 },
    { value: tagsText(capsule.tags), weight: 9 },
    { value: capsule.summary, weight: 7 },
    { value: capsule.description, weight: 6 },
    { value: capsule.platform, weight: 5 },
    { value: capsule.markdown, weight: 4 },
    { value: capsule.sourceUrl, weight: 3 },
    { value: capsule.rawText, weight: 2 }
  ];

  let score = 0;
  for (const field of fields) {
    const value = normalize(field.value);
    if (!value) continue;
    if (value.includes(q)) score += field.weight * 3;
    const words = tokenize(value, true);
    for (const term of terms) {
      if (value.includes(term)) score += field.weight;
      else if (hasLooseWordMatch(words, term)) score += field.weight * 0.45;
    }
  }

  return Math.round(score * 100) / 100;
}

export function scoreRelatedCapsule(source: SearchableCapsule, target: SearchableCapsule) {
  const sourceTags = new Set(tagsText(source.tags).split(" ").filter(Boolean));
  const targetTags = new Set(tagsText(target.tags).split(" ").filter(Boolean));
  const sharedTags = [...sourceTags].filter((tag) => targetTags.has(tag));
  const query = [
    source.title,
    source.summary,
    source.project?.name,
    [...sourceTags].join(" ")
  ]
    .filter(Boolean)
    .join(" ");

  let score = scoreCapsuleForSearch(target, query) * 0.28;
  if (source.project?.name && source.project.name === target.project?.name) score += 24;
  score += sharedTags.length * 12;
  if (source.platform && source.platform === target.platform) score += 6;
  if (source.sourceUrl && target.sourceUrl && urlHost(source.sourceUrl) === urlHost(target.sourceUrl)) score += 5;

  return Math.round(score * 100) / 100;
}

function tagsText(tags: SearchableCapsule["tags"]) {
  if (Array.isArray(tags)) return tags.join(" ");
  return safeJsonParseArray(tags).join(" ");
}

function normalize(value: string | null | undefined) {
  return value?.toLowerCase().replace(/[_-]+/g, " ").trim() ?? "";
}

function tokenize(value: string, keepStopWords = false) {
  return value
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((term) => term.length > 1 && (keepStopWords || !stopWords.has(term))) ?? [];
}

function expandTerms(terms: string[]) {
  const expanded = new Set<string>();
  for (const term of terms) {
    expanded.add(term);
    for (const alias of semanticAliases[term] ?? []) expanded.add(alias);
    for (const [key, aliases] of Object.entries(semanticAliases)) {
      if (aliases.includes(term)) expanded.add(key);
    }
  }
  return [...expanded];
}

function hasLooseWordMatch(words: string[], term: string) {
  if (term.length < 4) return false;
  return words.some((word) => word.length >= 4 && (word.startsWith(term.slice(0, 4)) || term.startsWith(word.slice(0, 4))));
}

function urlHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
