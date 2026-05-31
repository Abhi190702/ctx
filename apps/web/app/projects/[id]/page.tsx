import { notFound } from "next/navigation";
import { CapsuleList } from "@/components/capsules/CapsuleList";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { capsules: { orderBy: { updatedAt: "desc" } } }
  });
  if (!project) notFound();

  const memory = project.capsules
    .map((capsule) => `# ${capsule.title}\n${capsule.summary || capsule.rawText || ""}`)
    .join("\n\n---\n\n");

  return (
    <PageShell>
      <PageHeader title={project.name} description={project.description || "Combined project memory from every capsule."} />
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Combined Project Memory</h2>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-ink p-4 text-sm leading-6 text-slate-300">
            {memory || "No capsules are attached to this project yet."}
          </pre>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Project Metadata</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Repository</dt>
              <dd className="break-words text-slate-200">{project.repository || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Capsules</dt>
              <dd className="text-slate-200">{project.capsules.length}</dd>
            </div>
          </dl>
        </Card>
      </div>
      <CapsuleList capsules={project.capsules} />
    </PageShell>
  );
}
