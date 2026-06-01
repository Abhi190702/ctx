import Link from "next/link";
import { CapsuleList } from "@/components/capsules/CapsuleList";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { searchCapsulesWithScores } from "@/lib/search";

export const dynamic = "force-dynamic";

const suggestions = ["github pr review", "drop capsule", "bug fix", "project memory", "import chat"];

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q ?? "";
  const results = await searchCapsulesWithScores(q);
  const capsules = results.map(({ capsule }) => capsule);

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {q.trim() ? `${capsules.length} result${capsules.length === 1 ? "" : "s"} for "${q.trim()}"` : "Most recent capsules"}
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion}
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-mint/40 hover:text-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      </div>
      <CapsuleList capsules={capsules} />
    </PageShell>
  );
}
