import { notFound } from "next/navigation";
import { CapsuleEditor } from "@/components/capsules/CapsuleEditor";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { getCapsule } from "@/lib/capsules";

export const dynamic = "force-dynamic";

export default async function EditCapsulePage({ params }: { params: { id: string } }) {
  const capsule = await getCapsule(params.id);
  if (!capsule) notFound();

  return (
    <PageShell>
      <PageHeader title="Edit Capsule" description="Update structured memory and save a new version snapshot." />
      <Card>
        <CapsuleEditor capsule={capsule} />
      </Card>
    </PageShell>
  );
}
