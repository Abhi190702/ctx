import { CapsuleCard } from "./CapsuleCard";

export function RelatedCapsules({ capsules }: { capsules: any[] }) {
  if (!capsules.length) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-white">Related Memory</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {capsules.map((capsule) => (
          <CapsuleCard key={capsule.id} capsule={capsule} />
        ))}
      </div>
    </section>
  );
}
