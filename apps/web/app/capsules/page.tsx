import Link from "next/link";
import { Plus } from "lucide-react";
import { safeJsonParseArray } from "@ctx/core";
import { BackupActions } from "@/components/capsules/BackupActions";
import { CapsuleList } from "@/components/capsules/CapsuleList";
import { CapsuleSearch } from "@/components/capsules/CapsuleSearch";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { listCapsules } from "@/lib/capsules";
import { scoreCapsuleForSearch } from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function CapsulesPage({
  searchParams
}: {
  searchParams?: { q?: string; platform?: string; tag?: string };
}) {
  const q = (searchParams?.q ?? "").toLowerCase();
  const platform = searchParams?.platform;
  const tag = searchParams?.tag?.toLowerCase();
  const capsules = (await listCapsules())
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
      <CapsuleSearch defaultValue={searchParams?.q} />
      <CapsuleList capsules={capsules} />
    </PageShell>
  );
}
