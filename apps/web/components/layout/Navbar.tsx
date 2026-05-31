import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white lg:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-mint/40 bg-mint/10 text-xs text-mint">
            CTX
          </span>
          CTX
        </Link>
        <form action="/search" className="hidden flex-1 md:block">
          <label className="sr-only" htmlFor="global-search">
            Search Capsules
          </label>
          <div className="relative max-w-xl">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              id="global-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Search capsules..."
              className="h-10 w-full rounded-lg border border-line bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
            />
          </div>
        </form>
        <Link href="/capsules/new">
          <Button type="button" size="sm">
            <Plus aria-hidden="true" className="h-4 w-4" />
            New Capsule
          </Button>
        </Link>
      </div>
    </header>
  );
}
