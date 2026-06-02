import Link from "next/link";
import { ArrowUpRight, Clock, Cpu, Download, ExternalLink } from "lucide-react";
import { CapsuleTags } from "./CapsuleTags";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { platformLabel } from "@/lib/platform";

export function CapsuleCard({ capsule }: { capsule: any }) {
  return (
    <Card className="group h-full transition-colors duration-150 hover:border-mint/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/capsules/${capsule.id}`} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint">
            <h2 className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-mint">{capsule.title}</h2>
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {capsule.summary || capsule.description || "No summary yet. Add one to make this capsule easier to reuse."}
          </p>
        </div>
        <Badge className="shrink-0 text-mint">{platformLabel(capsule.platform)}</Badge>
      </div>
      <div className="mt-4">
        <CapsuleTags tags={capsule.tags} />
      </div>
      {capsule.status === "archived" ? (
        <p className="mt-4 rounded-xl border border-amber/30 bg-amber/10 px-3 py-2 text-xs font-medium text-amber">Archived memory</p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Cpu aria-hidden="true" className="h-3.5 w-3.5" />
          {capsule.tokenEstimate} tokens
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden="true" className="h-3.5 w-3.5" />
          {formatDateTime(capsule.updatedAt)}
        </span>
        {capsule.sourceUrl ? (
          <a href={capsule.sourceUrl} className="inline-flex items-center gap-1 hover:text-foreground" target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            Source
          </a>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/capsules/${capsule.id}`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-line bg-panel px-3 text-sm font-medium text-foreground transition-colors hover:border-mint hover:bg-mint-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
        >
          Open
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
        <a
          href={`/api/export?id=${capsule.id}`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-line bg-panel px-3 text-sm font-medium text-foreground transition-colors hover:border-mint hover:bg-mint-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
        >
          Export
          <Download aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  );
}
