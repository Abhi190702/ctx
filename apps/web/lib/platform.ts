export const supportedPlatforms = [
  "chatgpt",
  "claude",
  "gemini",
  "cursor",
  "windsurf",
  "github",
  "perplexity",
  "mcp"
] as const;

export function platformLabel(platform?: string | null) {
  if (!platform) return "Manual";
  return platform
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
