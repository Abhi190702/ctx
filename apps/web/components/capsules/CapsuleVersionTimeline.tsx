import { formatDateTime } from "@/lib/utils";

export function CapsuleVersionTimeline({ versions }: { versions: any[] }) {
  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div key={version.id} className="rounded-lg border border-line bg-white/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-white">Version {version.version}</span>
            <span className="text-xs text-slate-500">{formatDateTime(version.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{version.changeNote || "Snapshot saved."}</p>
        </div>
      ))}
    </div>
  );
}
