import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "./ProjectCard";

export function ProjectList({ projects }: { projects: any[] }) {
  if (!projects.length) {
    return (
      <EmptyState
        title="No Projects Yet"
        description="Projects appear automatically when you create capsules with a project name."
        href="/capsules/new"
        action="Create Capsule"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
