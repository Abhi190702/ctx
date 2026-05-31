import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export function RecentInjections({ activity }: { activity: any[] }) {
  const injections = activity.filter((item) => item.type === "capsule_injected").slice(0, 6);
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Recent Injections</h2>
      <div className="mt-4 space-y-3">
        {injections.length ? (
          injections.map((item) => (
            <div key={item.id} className="rounded-lg border border-line bg-white/[0.03] p-3">
              <p className="text-sm text-slate-200">{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">Injection logs appear after using the CTX button or copy action.</p>
        )}
      </div>
    </Card>
  );
}
