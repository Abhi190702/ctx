const platforms = ["ChatGPT", "Claude", "Gemini", "Cursor", "Windsurf", "GitHub", "MCP"];

export function PlatformBadges() {
  return (
    <div className="mt-6 flex flex-wrap gap-2" aria-label="Supported platforms">
      {platforms.map((platform) => (
        <span key={platform} className="rounded-md border border-line bg-white/5 px-3 py-1 text-xs text-slate-300">
          {platform}
        </span>
      ))}
    </div>
  );
}
