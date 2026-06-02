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
        <label htmlFor="search-page-input" className="mb-2 block text-sm font-medium text-foreground">
          Search Capsules
        </label>
        <input
          id="search-page-input"
          name="q"
          type="search"
          autoComplete="off"
          defaultValue={q}
          placeholder="Try github, kubernetes, launch plan..."
          className="h-11 w-full rounded-xl border border-line bg-panel px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
        />
      </form>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {q.trim() ? `${capsules.length} result${capsules.length === 1 ? "" : "s"} for "${q.trim()}"` : "Most recent capsules"}
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion}
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              className="rounded-xl border border-line bg-ink px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-mint/40 hover:text-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
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
