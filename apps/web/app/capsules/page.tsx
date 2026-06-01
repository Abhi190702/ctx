import Link from "next/link";
import { Plus } from "lucide-react";
import { safeJsonParseArray } from "@ctx/core";
import { BackupActions } from "@/components/capsules/BackupActions";
import { CapsuleBulkActions } from "@/components/capsules/CapsuleBulkActions";
import { CapsuleList } from "@/components/capsules/CapsuleList";
import { CapsuleSearch } from "@/components/capsules/CapsuleSearch";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { listCapsulesByStatus } from "@/lib/capsules";
import { scoreCapsuleForSearch } from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function CapsulesPage({
  searchParams
}: {
  searchParams?: { q?: string; platform?: string; tag?: string; status?: "active" | "archived" | "all" };
}) {
  const q = (searchParams?.q ?? "").toLowerCase();
  const platform = searchParams?.platform;
  const tag = searchParams?.tag?.toLowerCase();
  const status = normalizeStatus(searchParams?.status);
  const capsules = (await listCapsulesByStatus({ status }))
    .map((capsule) => ({ capsule, score: q ? scoreCapsuleForSearch(capsule, q) : 1 }))
    .filter(({ capsule, score }) => score > 0 && (!platform || capsule.platform === platform) && (!tag || safeJsonParseArray(capsule.tags).includes(tag)))
    .sort((a, b) => b.score - a.score)
    .map(({ capsule }) => capsule);

  return (
    <PageShell>
      <PageHeader
        title="Capsules"
        description="Search, filter, version, export, and reuse structured AI memory."
        action={
          <div className="flex flex-wrap gap-2">
            <BackupActions />
            <Link href="/capsules/new">
              <Button type="button">
                <Plus aria-hidden="true" className="h-4 w-4" />
                Generate Capsule
              </Button>
            </Link>
          </div>
        }
      />
      <CapsuleSearch defaultValue={searchParams?.q} defaultPlatform={platform} defaultTag={searchParams?.tag} defaultStatus={status} />
      <CapsuleBulkActions capsules={capsules} />
      <CapsuleList capsules={capsules} />
    </PageShell>
  );
}

function normalizeStatus(status: string | undefined): "active" | "archived" | "all" {
  return status === "archived" || status === "all" ? status : "active";
}
