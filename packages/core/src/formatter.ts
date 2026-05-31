import type { PortableCapsule } from "./schema";

function section(title: string, items: string[] | string | null | undefined): string {
  if (!items || (Array.isArray(items) && items.length === 0)) return "";
  const body = Array.isArray(items) ? items.map((item) => `- ${item}`).join("\n") : items;
  return `\n## ${title}\n${body}\n`;
}

export function formatCapsuleAsMarkdown(capsule: PortableCapsule): string {
  const source = capsule.source?.url ? `\nSource: ${capsule.source.url}\n` : "";
  const tags = capsule.tags.length ? `\nTags: ${capsule.tags.map((tag) => `#${tag}`).join(" ")}\n` : "";

  return [
    `# ${capsule.title}`,
    capsule.description ? `\n${capsule.description}\n` : "",
    source,
    tags,
    capsule.summary ? `\n## Summary\n${capsule.summary}\n` : "",
    section("Goals", capsule.goals),
    section("Decisions", capsule.decisions),
    section("Constraints", capsule.constraints),
    section("Open Questions", capsule.openQuestions),
    section("Next Steps", capsule.nextSteps),
    capsule.content.markdown ? `\n## Notes\n${capsule.content.markdown}\n` : "",
    capsule.content.rawText ? `\n## Raw Context\n${capsule.content.rawText}\n` : ""
  ]
    .filter(Boolean)
    .join("")
    .trim();
}

export function formatCapsuleForInjection(capsule: PortableCapsule): string {
  return [
    "You are being given a CTX context capsule.",
    "",
    "Use this as background context. Do not simply repeat it. Continue the work based on this memory.",
    "",
    `# Capsule: ${capsule.title}`,
    capsule.summary ? `\n## Summary\n${capsule.summary}` : "",
    section("Goals", capsule.goals),
    section("Decisions", capsule.decisions),
    section("Constraints", capsule.constraints),
    section("Open Questions", capsule.openQuestions),
    section("Next Steps", capsule.nextSteps),
    capsule.content.markdown ? `\n## Working Notes\n${capsule.content.markdown}` : "",
    capsule.content.rawText ? `\n## Raw Context\n${capsule.content.rawText}` : ""
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}
