import { Card } from "@/components/ui/card";

export function UsageChart({ stats }: { stats: any }) {
  const values = [
    { label: "Capsules", value: stats.totalCapsules, color: "bg-mint" },
    { label: "Projects", value: stats.totalProjects, color: "bg-sky" },
    { label: "Injections", value: stats.totalInjections, color: "bg-amber" }
  ];
  const max = Math.max(1, ...values.map((value) => value.value));

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Workflow Activity</h2>
      <div className="mt-6 flex h-48 items-end gap-4">
        {values.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end rounded-lg bg-white/[0.03] p-2">
              <div className={`w-full rounded-md ${item.color}`} style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }} />
            </div>
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
