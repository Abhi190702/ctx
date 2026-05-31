import Link from "next/link";
import {
  Activity,
  Boxes,
  Github,
  Home,
  Network,
  Search,
  Settings,
  Sparkles
} from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/capsules", label: "Capsules", icon: Boxes },
  { href: "/projects", label: "Projects", icon: Network },
  { href: "/search", label: "Search", icon: Search },
  { href: "/monitor", label: "Monitor", icon: Activity },
  { href: "/github", label: "GitHub", icon: Github },
  { href: "/mcp", label: "MCP", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-line bg-ink/80 p-4 lg:block">
      <Link href="/" className="mb-6 flex items-center gap-3 rounded-lg px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-mint/30 bg-mint/10 text-sm font-bold text-mint">
          CTX
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">CTX</span>
          <span className="block text-xs text-slate-500">Portable memory</span>
        </span>
      </Link>
      <nav aria-label="Primary">
        <ul className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors duration-150 hover:bg-white/6 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
