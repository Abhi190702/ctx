import Link from "next/link";
import { Github, Plus, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const actions = [
  { href: "/capsules/new", label: "Create Capsule", icon: Plus },
  { href: "/search", label: "Search Memory", icon: Search },
  { href: "/github", label: "Capture GitHub", icon: Github },
  { href: "/mcp", label: "Configure MCP", icon: Sparkles }
];

export function QuickActions() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.03] p-3 text-sm text-slate-200 hover:border-mint/40 hover:text-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
