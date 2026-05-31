import { detectPlatformFromUrl, normalizeTags, type CreateCapsuleInput } from "@ctx/core";

type QuickCapsuleInput = {
  text?: string;
  rawText?: string;
  markdown?: string;
  title?: string;
  url?: string;
  sourceUrl?: string;
  platform?: string;
  projectName?: string;
  tags?: string[] | string;
  sourceType?: string;
};

const keywordTags: Array<[RegExp, string]> = [
  [/github|pull request|issue|commit|repo/i, "github"],
  [/chrome|extension|browser/i, "extension"],
  [/chatgpt|claude|gemini|perplexity|cursor/i, "ai-chat"],
  [/mcp|model context protocol/i, "mcp"],
  [/next\.?js|react|tailwind/i, "frontend"],
  [/api|route|endpoint|server/i, "api"],
  [/prisma|sqlite|database|schema/i, "database"],
  [/docker|deploy|ci|workflow|actions/i, "devops"],
  [/bug|error|failed|fix|debug/i, "debugging"],
  [/research|paper|citation|literature/i, "research"]
];

export function buildQuickCapsuleInput(input: QuickCapsuleInput): CreateCapsuleInput {
  const rawText = cleanText(input.text ?? input.rawText ?? input.markdown ?? "");
  if (!rawText.trim()) throw new Error("Paste, select, or capture some text before generating a capsule.");

  const sourceUrl = normalizeSourceUrl(input.url ?? input.sourceUrl);
  const platform = input.platform || detectPlatformFromUrl(sourceUrl);
  const title = inferTitle(input.title, rawText, sourceUrl);
  const summary = summarize(rawText);
  const projectName = input.projectName?.trim() || inferProjectName(sourceUrl, rawText);
  const tags = inferTags(rawText, sourceUrl, platform, input.tags);
  const goals = pickLines(rawText, [/goal/i, /\bwant\b/i, /\bneed\b/i, /\bbuild\b/i, /\bmake\b/i]);
  const decisions = pickLines(rawText, [/decid/i, /\buse\b/i, /\bchosen\b/i, /\bapproach\b/i, /\barchitecture\b/i]);
  const constraints = pickLines(rawText, [/must\b/i, /do not/i, /avoid/i, /constraint/i, /cannot|can't/i, /require/i]);
  const openQuestions = pickLines(rawText, [/\?$/, /question/i, /unclear/i, /decide later/i]);
  const nextSteps = pickLines(rawText, [/next/i, /todo/i, /fix/i, /add/i, /implement/i, /follow.?up/i, /ship/i]);

  return {
    title,
    description: summary,
    summary,
    rawText,
    markdown: buildMarkdown({ title, summary, goals, decisions, constraints, openQuestions, nextSteps }),
    platform,
    sourceUrl,
    sourceType: input.sourceType ?? "quick_capture",
    projectName,
    goals,
    decisions,
    constraints,
    openQuestions,
    nextSteps,
    tags,
    importance: inferImportance(rawText)
  };
}

function cleanText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 60000);
}

function normalizeSourceUrl(url: string | null | undefined) {
  const trimmed = url?.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) return "";
  try {
    const parsed = new URL(trimmed);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function inferTitle(title: string | undefined, text: string, sourceUrl: string) {
  if (title?.trim()) return title.trim().slice(0, 90);
  const heading = text
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .find((line) => line.length >= 8 && line.length <= 90 && !line.endsWith("."));
  if (heading) return heading;
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      const parts = url.pathname.split("/").filter(Boolean);
      if (url.hostname.includes("github.com") && parts.length >= 2) return `${parts[0]}/${parts[1]} Context`;
      if (url.hostname) return `${url.hostname.replace(/^www\./, "")} Capture`;
    } catch {
      // Ignore invalid pasted URLs; the schema layer will store an empty source URL.
    }
  }
  const firstLine = text.split(/[.!?\n]/).find((part) => part.trim().length > 8)?.trim();
  return (firstLine || "Captured Context").slice(0, 90);
}

function summarize(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  const sentences = compact.match(/[^.!?]+[.!?]+/g)?.slice(0, 2).join(" ").trim();
  return (sentences || compact).slice(0, 360);
}

function inferProjectName(sourceUrl: string, text: string) {
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      const parts = url.pathname.split("/").filter(Boolean);
      if (url.hostname.includes("github.com") && parts.length >= 2) return parts[1];
      const host = url.hostname.replace(/^www\./, "");
      if (host && !host.includes("chatgpt") && !host.includes("claude") && !host.includes("gemini")) return host.split(".")[0];
    } catch {
      return undefined;
    }
  }
  const match = text.match(/\bproject\s*[:=-]\s*([A-Za-z0-9 _.-]{2,50})/i);
  return match?.[1]?.trim();
}

function inferTags(text: string, sourceUrl: string, platform?: string | null, tags?: string[] | string) {
  const inferred: string[] = [];
  if (platform) inferred.push(platform);
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      inferred.push(url.hostname.replace(/^www\./, "").split(".")[0]);
    } catch {
      // Keep tag inference resilient.
    }
  }
  for (const [pattern, tag] of keywordTags) {
    if (pattern.test(text)) inferred.push(tag);
  }
  const provided = Array.isArray(tags) ? tags : tags?.split(/[,#\n]/g);
  return normalizeTags([...(provided ?? []), ...inferred]).slice(0, 10);
}

function pickLines(text: string, patterns: RegExp[]) {
  const lines = text
    .split(/\n|(?<=\.)\s+/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((line) => line.length >= 10 && line.length <= 220);

  const picked = lines.filter((line) => patterns.some((pattern) => pattern.test(line)));
  return Array.from(new Set(picked)).slice(0, 6);
}

function inferImportance(text: string) {
  if (/urgent|blocker|critical|must|deadline|production/i.test(text)) return 8;
  if (/decision|architecture|bug|fix|todo|next/i.test(text)) return 6;
  return 4;
}

function buildMarkdown(input: {
  title: string;
  summary: string;
  goals: string[];
  decisions: string[];
  constraints: string[];
  openQuestions: string[];
  nextSteps: string[];
}) {
  const sections = [
    ["Summary", [input.summary]],
    ["Goals", input.goals],
    ["Decisions", input.decisions],
    ["Constraints", input.constraints],
    ["Open Questions", input.openQuestions],
    ["Next Steps", input.nextSteps]
  ] as const;

  return [
    `# ${input.title}`,
    ...sections
      .filter(([, lines]) => lines.length)
      .flatMap(([heading, lines]) => ["", `## ${heading}`, ...lines.map((line) => `- ${line}`)])
  ].join("\n");
}
