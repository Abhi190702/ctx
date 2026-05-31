import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ProjectList } from "@/components/projects/ProjectList";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { capsules: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <PageShell>
      <PageHeader title="Projects" description="Group capsules into durable project memory spaces." />
      <div className="mb-6">
        <ProjectForm />
      </div>
      <ProjectList projects={projects} />
    </PageShell>
  );
}
