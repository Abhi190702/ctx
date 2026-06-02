const platforms = ["ChatGPT", "Claude", "Gemini", "Cursor", "Windsurf", "GitHub", "MCP"];

export function PlatformBadges() {
  return (
    <div className="mt-6 flex flex-wrap gap-2" aria-label="Supported platforms">
      {platforms.map((platform) => (
        <span key={platform} className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          {platform}
        </span>
      ))}
    </div>
  );
}
