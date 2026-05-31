import { CapsuleCard } from "./CapsuleCard";
import { EmptyState } from "@/components/ui/empty-state";

export function CapsuleList({ capsules }: { capsules: any[] }) {
  if (!capsules.length) {
    return (
      <EmptyState
        title="No Capsules Yet"
        description="Generate one from a chat, doc, GitHub page, or imported notes."
        href="/capsules/new"
        action="Generate Capsule"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {capsules.map((capsule) => (
        <CapsuleCard key={capsule.id} capsule={capsule} />
      ))}
    </div>
  );
}
