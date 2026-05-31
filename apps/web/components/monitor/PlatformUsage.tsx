import { Card } from "@/components/ui/card";
import { platformLabel } from "@/lib/platform";

export function PlatformUsage({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution);
  const max = Math.max(1, ...entries.map(([, count]) => count));

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Platform Usage</h2>
      <div className="mt-4 space-y-3">
        {entries.length ? (
          entries.map(([platform, count]) => (
            <div key={platform}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-300">{platformLabel(platform)}</span>
                <span className="text-slate-500">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div className="h-2 rounded-full bg-mint" style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">Platform data appears after capsules are created.</p>
        )}
      </div>
    </Card>
  );
}
