import { CapsuleCard } from "@/components/capsules/CapsuleCard";
import { EmptyState } from "@/components/ui/empty-state";

export function RecentCapsules({ capsules }: { capsules: any[] }) {
  if (!capsules.length) {
    return (
      <EmptyState
        title="No Recent Capsules"
        description="Create your first capsule, capture a page with the extension, or import one from GitHub."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {capsules.slice(0, 3).map((capsule) => (
        <CapsuleCard key={capsule.id} capsule={capsule} />
      ))}
    </div>
  );
}
