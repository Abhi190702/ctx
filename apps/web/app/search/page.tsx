import { CapsuleList } from "@/components/capsules/CapsuleList";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { searchCapsules } from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q ?? "";
  const capsules = await searchCapsules(q);

  return (
    <PageShell>
      <PageHeader title="Search" description="Search across titles, summaries, tags, markdown, and raw captured context." />
      <form action="/search" className="mb-6">
        <label htmlFor="search-page-input" className="mb-2 block text-sm font-medium text-slate-200">
          Search Capsules
        </label>
        <input
          id="search-page-input"
          name="q"
          type="search"
          autoComplete="off"
          defaultValue={q}
          placeholder="Try github, kubernetes, launch plan..."
          className="h-11 w-full rounded-lg border border-line bg-panel px-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
        />
      </form>
      <CapsuleList capsules={capsules} />
    </PageShell>
  );
}
