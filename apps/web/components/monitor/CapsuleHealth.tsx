import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CapsuleHealth({ stats }: { stats: any }) {
  const checks = [
    { label: "Missing Summary", value: stats.capsulesMissingSummary },
    { label: "No Tags", value: stats.capsulesWithoutTags },
    { label: "Stale Capsules", value: stats.staleCapsules },
    { label: "High Token Capsules", value: stats.highTokenCapsules }
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Capsule Health</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between rounded-lg border border-line bg-white/[0.03] p-3">
            <span className="text-sm text-slate-300">{check.label}</span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              {check.value > 0 ? (
                <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber" />
              ) : (
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-mint" />
              )}
              {check.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
