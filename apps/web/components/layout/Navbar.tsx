import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const mobileNav = [
  { href: "/capsules", label: "Capsules" },
  { href: "/projects", label: "Projects" },
  { href: "/monitor", label: "Monitor" },
  { href: "/github", label: "GitHub" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 w-full max-w-[100vw] overflow-hidden border-b border-line bg-panel/80 px-4 py-3 backdrop-blur-xl sm:px-6 md:px-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground lg:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-mint/40 bg-mint/10 text-xs text-mint">
            CTX
          </span>
          CTX
        </Link>
        <form action="/search" className="hidden flex-1 md:block">
          <label className="sr-only" htmlFor="global-search">
            Search Capsules
          </label>
          <div className="relative max-w-xl">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              id="global-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Search capsules..."
              className="h-10 w-full rounded-xl border border-line bg-ink/70 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
            />
          </div>
        </form>
        <Link href="/capsules/new">
          <Button type="button" size="sm">
            <Plus aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">New Capsule</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Mobile sections">
        {mobileNav.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-line bg-ink px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
