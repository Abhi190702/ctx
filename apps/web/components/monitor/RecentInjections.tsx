import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export function RecentInjections({ activity }: { activity: any[] }) {
  const injections = activity.filter((item) => item.type === "capsule_injected").slice(0, 6);
  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground">Recent Injections</h2>
      <div className="mt-4 space-y-3">
        {injections.length ? (
          injections.map((item) => (
            <div key={item.id} className="rounded-xl border border-line bg-ink p-3">
              <p className="text-sm text-foreground">{item.message}</p>
              <p className="mt-1 text-xs text-muted">{formatDateTime(item.createdAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Injection logs appear after using the CTX button or copy action.</p>
        )}
      </div>
    </Card>
  );
}
