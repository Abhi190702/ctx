import { QuickCapsuleCreator } from "@/components/capsules/QuickCapsuleCreator";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export default function NewCapsulePage() {
  return (
    <PageShell>
      <PageHeader
        title="Generate Capsule"
        description="Fast capture for conversations, docs, logs, GitHub context, and project notes."
      />
      <QuickCapsuleCreator />
    </PageShell>
  );
}
