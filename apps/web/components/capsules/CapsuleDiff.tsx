type CapsuleVersion = {
  id: string;
  version: number;
  snapshot?: string | null;
};

type DiffLine = {
  text: string;
  key: string;
};

export function CapsuleDiff({ versions }: { versions: CapsuleVersion[] }) {
  const [current, previous] = versions;
  if (!current || !previous) {
    return <p className="text-sm leading-6 text-muted-foreground">The first saved version is the baseline. Future edits will show a visual diff here.</p>;
  }

  const currentLines = snapshotLines(current.snapshot);
  const previousLines = snapshotLines(previous.snapshot);
  const added = toDiffLines(currentLines.filter((line) => !previousLines.includes(line)));
  const removed = toDiffLines(previousLines.filter((line) => !currentLines.includes(line)));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-mint/30 bg-mint/[0.05] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">Added</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{added.length}</p>
        </div>
        <div className="rounded-xl border border-rose/30 bg-rose/[0.05] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">Removed</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{removed.length}</p>
        </div>
      </div>

      {added.length || removed.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <DiffBlock title="Added Lines" tone="added" lines={added} />
          <DiffBlock title="Removed Lines" tone="removed" lines={removed} />
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-ink p-3 text-sm leading-6 text-muted-foreground">
          No readable content changes between the latest two versions.
        </p>
      )}
    </div>
  );
}

function DiffBlock({ title, tone, lines }: { title: string; tone: "added" | "removed"; lines: DiffLine[] }) {
  const mark = tone === "added" ? "+" : "-";
  const color = tone === "added" ? "text-mint" : "text-rose";
  return (
    <div className="rounded-xl border border-line bg-ink p-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
        {lines.length ? (
          lines.slice(0, 20).map((line) => (
            <p key={line.key} className="grid grid-cols-[18px_1fr] gap-2 text-sm leading-6 text-muted-foreground">
              <span className={color}>{mark}</span>
              <span>{line.text}</span>
            </p>
          ))
        ) : (
          <p className="text-sm text-muted">Nothing in this side of the diff.</p>
        )}
      </div>
    </div>
  );
}

function snapshotLines(snapshot: string | null | undefined): string[] {
  const lines = flattenSnapshot(snapshot).map((line) => line.trim()).filter(Boolean);
  return [...new Set(lines)];
}

function toDiffLines(lines: string[]): DiffLine[] {
  return lines.map((line, index) => ({ text: line, key: `${index}-${line}` }));
}

function flattenSnapshot(snapshot: string | null | undefined): string[] {
  if (!snapshot) return [];
  try {
    const parsed = JSON.parse(snapshot);
    return [
      labeled("Title", parsed.title),
      labeled("Summary", parsed.summary),
      ...sectionLines("Goals", parsed.goals),
      ...sectionLines("Decisions", parsed.decisions),
      ...sectionLines("Constraints", parsed.constraints),
      ...sectionLines("Open Questions", parsed.openQuestions),
      ...sectionLines("Next Steps", parsed.nextSteps),
      ...sectionLines("Tags", parsed.tags),
      ...textLines("Notes", parsed.content?.markdown),
      ...textLines("Raw", parsed.content?.rawText)
    ].filter(Boolean);
  } catch {
    return textLines("Snapshot", snapshot);
  }
}

function labeled(label: string, value: unknown) {
  return typeof value === "string" && value.trim() ? `${label}: ${value.trim()}` : "";
}

function sectionLines(label: string, value: unknown) {
  return Array.isArray(value) ? value.map((item) => `${label}: ${String(item).trim()}`).filter((line) => line.length > label.length + 2) : [];
}

function textLines(label: string, value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-#*\s]+/, "").trim())
    .filter((line) => line.length > 8)
    .slice(0, 80)
    .map((line) => `${label}: ${line}`);
}
