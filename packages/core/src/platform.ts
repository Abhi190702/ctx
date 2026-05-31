export function detectPlatformFromUrl(url: string | null | undefined): string {
  if (!url) return "manual";
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("chatgpt.com") || host.includes("chat.openai.com")) return "chatgpt";
    if (host.includes("claude.ai")) return "claude";
    if (host.includes("gemini.google.com")) return "gemini";
    if (host.includes("perplexity.ai")) return "perplexity";
    if (host.includes("github.com")) return "github";
    if (host.includes("cursor.com")) return "cursor";
    if (host.includes("windsurf")) return "windsurf";
    return "web";
  } catch {
    return "manual";
  }
}
