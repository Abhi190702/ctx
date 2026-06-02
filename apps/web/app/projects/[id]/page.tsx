import { notFound } from "next/navigation";
import { CapsuleList } from "@/components/capsules/CapsuleList";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectMemoryWorkspace } from "@/components/projects/ProjectMemoryWorkspace";
import { prisma } from "@/lib/db";
import { buildProjectMemory } from "@/lib/project-memory";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { capsules: { orderBy: { updatedAt: "desc" } } }
  });
  if (!project) notFound();
  const memory = buildProjectMemory(project);

  return (
    <PageShell>
      <PageHeader title={project.name} description={project.description || "Combined project memory from every capsule."} />
      <div className="space-y-8">
        <ProjectMemoryWorkspace memory={memory} />
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Project Capsules</h2>
          <CapsuleList capsules={memory.activeCapsules} />
        </section>
      </div>
    </PageShell>
  );
}
