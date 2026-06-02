import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="transition-colors duration-150 hover:border-mint/40">
      <Link href={`/projects/${project.id}`} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint">
        <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
      </Link>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{project.description || "Project memory workspace."}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span>{project.capsules?.length ?? 0} capsules</span>
        <span>Updated {formatDate(project.updatedAt)}</span>
        {project.repository ? (
          <a href={project.repository} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
            <GitBranch aria-hidden="true" className="h-3.5 w-3.5" />
            Repository
          </a>
        ) : null}
      </div>
    </Card>
  );
}
