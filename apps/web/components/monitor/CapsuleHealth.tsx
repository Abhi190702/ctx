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
      <h2 className="text-lg font-semibold text-foreground">Capsule Health</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between rounded-xl border border-line bg-ink p-3">
            <span className="text-sm text-muted-foreground">{check.label}</span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
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
