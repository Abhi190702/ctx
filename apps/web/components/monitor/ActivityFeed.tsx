import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export function ActivityFeed({ activity }: { activity: any[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
      <div className="mt-4 space-y-3">
        {activity.length ? (
          activity.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg border border-line bg-white/[0.03] p-3">
              <Activity aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
              <div className="min-w-0">
                <p className="break-words text-sm text-slate-200">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No activity has been logged yet.</p>
        )}
      </div>
    </Card>
  );
}
