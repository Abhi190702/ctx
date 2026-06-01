import { formatDateTime } from "@/lib/utils";
import { RestoreVersionButton } from "./RestoreVersionButton";

export function CapsuleVersionTimeline({ capsuleId, versions }: { capsuleId: string; versions: any[] }) {
  const latestVersion = Math.max(...versions.map((version) => version.version));

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div key={version.id} className="rounded-lg border border-line bg-white/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-white">Version {version.version}</span>
            <span className="text-xs text-slate-500">{formatDateTime(version.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{version.changeNote || "Snapshot saved."}</p>
          {version.version !== latestVersion ? (
            <div className="mt-3">
              <RestoreVersionButton capsuleId={capsuleId} versionId={version.id} version={version.version} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
