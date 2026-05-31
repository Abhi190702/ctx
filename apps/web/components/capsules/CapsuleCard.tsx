import Link from "next/link";
import { Clock, Cpu, ExternalLink } from "lucide-react";
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
            <h2 className="line-clamp-2 text-lg font-semibold text-white group-hover:text-mint">{capsule.title}</h2>
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
            {capsule.summary || capsule.description || "No summary yet. Add one to make this capsule easier to reuse."}
          </p>
        </div>
        <Badge className="shrink-0 text-mint">{platformLabel(capsule.platform)}</Badge>
      </div>
      <div className="mt-4">
        <CapsuleTags tags={capsule.tags} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Cpu aria-hidden="true" className="h-3.5 w-3.5" />
          {capsule.tokenEstimate} tokens
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden="true" className="h-3.5 w-3.5" />
          {formatDateTime(capsule.updatedAt)}
        </span>
        {capsule.sourceUrl ? (
          <a href={capsule.sourceUrl} className="inline-flex items-center gap-1 hover:text-white" target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            Source
          </a>
        ) : null}
      </div>
    </Card>
  );
}
