import { cn } from "@/lib/utils";

export function Tabs({ tabs, active }: { tabs: string[]; active: string }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-ink p-1" role="tablist" aria-label="Sections">
      {tabs.map((tab) => (
        <span
          key={tab}
          role="tab"
          aria-selected={tab === active}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm text-muted-foreground",
            tab === active && "bg-mint text-ink",
          )}
        >
          {tab}
        </span>
      ))}
    </div>
  );
}
