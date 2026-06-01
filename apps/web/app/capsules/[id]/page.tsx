import Link from "next/link";
import { Edit } from "lucide-react";
import { formatCapsuleForInjection } from "@ctx/core";
import { CapsuleFormatPreview } from "@/components/capsules/CapsuleFormatPreview";
import { CapsuleDiff } from "@/components/capsules/CapsuleDiff";
import { CapsulePreview } from "@/components/capsules/CapsulePreview";
import { RelatedCapsules } from "@/components/capsules/RelatedCapsules";
import { CapsuleTags } from "@/components/capsules/CapsuleTags";
import { CapsuleVersionTimeline } from "@/components/capsules/CapsuleVersionTimeline";
import { ArchiveCapsuleButton } from "@/components/capsules/ArchiveCapsuleButton";
import { DeleteCapsuleButton } from "@/components/capsules/DeleteCapsuleButton";
import { ExportCapsuleButton } from "@/components/capsules/ExportCapsuleButton";
import { InjectButton } from "@/components/capsules/InjectButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getCapsule, toPortableCapsule } from "@/lib/capsules";
import { getRelatedCapsules } from "@/lib/search";
import { formatDateTime } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CapsuleDetailPage({ params }: { params: { id: string } }) {
  const capsule = await getCapsule(params.id);
  if (!capsule) notFound();
  const portable = toPortableCapsule(capsule);
  const injection = formatCapsuleForInjection(portable);
  const relatedCapsules = await getRelatedCapsules(capsule);

  return (
    <PageShell>
      <PageHeader
        title={capsule.title}
        description={capsule.summary || capsule.description || "Portable CTX memory capsule."}
        action={
          <div className="flex flex-wrap gap-2">
            <InjectButton text={injection} />
            <ExportCapsuleButton id={capsule.id} />
            <ArchiveCapsuleButton id={capsule.id} archived={capsule.status === "archived"} />
            <DeleteCapsuleButton id={capsule.id} title={capsule.title} />
            <Link href={`/capsules/${capsule.id}/edit`}>
              <Button type="button" variant="secondary">
                <Edit aria-hidden="true" className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span>Platform: {capsule.platform || "manual"}</span>
        <span>Status: {capsule.status || "active"}</span>
        <span>Tokens: {capsule.tokenEstimate}</span>
        <span>Updated: {formatDateTime(capsule.updatedAt)}</span>
      </div>
      <div className="mb-6">
        <CapsuleTags tags={capsule.tags} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <CapsulePreview capsule={portable} />
          <Card>
            <CardHeader>
              <CardTitle>AI Injection Preview</CardTitle>
            </CardHeader>
            <CapsuleFormatPreview capsule={portable} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Latest Version Diff</CardTitle>
            </CardHeader>
            <CapsuleDiff versions={capsule.versions} />
          </Card>
          <RelatedCapsules capsules={relatedCapsules} />
        </div>
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version Timeline</CardTitle>
            </CardHeader>
            <CapsuleVersionTimeline capsuleId={capsule.id} versions={capsule.versions} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {capsule.activities.map((activity) => (
                <div key={activity.id} className="rounded-lg border border-line bg-white/[0.03] p-3">
                  <p className="text-sm text-slate-200">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(activity.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
