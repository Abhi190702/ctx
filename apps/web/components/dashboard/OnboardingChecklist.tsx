import Link from "next/link";
import { CheckCircle2, Circle, Github, Plug, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

type OnboardingChecklistProps = {
  stats: {
    totalCapsules: number;
    totalProjects: number;
    totalInjections: number;
  };
  githubConfigured: boolean;
};

export function OnboardingChecklist({ stats, githubConfigured }: OnboardingChecklistProps) {
  const items = [
    {
      label: "Capture first memory",
      description: "Create one capsule from a pasted chat, note, file, or selected page text.",
      href: "/capsules/new",
      done: stats.totalCapsules > 0,
      icon: Sparkles
    },
    {
      label: "Create project memory",
      description: "Group related capsules so retrieval stays focused when work grows.",
      href: "/projects",
      done: stats.totalProjects > 0,
      icon: Search
    },
    {
      label: "Reuse a capsule",
      description: "Drop a capsule into ChatGPT, Claude, Gemini, Cursor, or any prompt box.",
      href: "/capsules",
      done: stats.totalInjections > 0,
      icon: Plug
    },
    {
      label: "Enable GitHub capture",
      description: "Add a GitHub token when you want PR, issue, README, and repo memory.",
      href: "/github",
      done: githubConfigured,
      icon: Github
    }
  ];

  const complete = items.filter((item) => item.done).length;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Readiness</h2>
          <p className="mt-1 text-sm text-slate-400">{complete} of {items.length} ready</p>
        </div>
        <span className="rounded-lg border border-mint/30 bg-mint/10 px-2.5 py-1 text-xs font-semibold text-mint">
          Setup
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${(complete / items.length) * 100}%` }} />
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const StateIcon = item.done ? CheckCircle2 : Circle;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex gap-3 rounded-lg border border-line bg-white/[0.03] p-3 hover:border-mint/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel">
                <Icon aria-hidden="true" className="h-4 w-4 text-slate-300 group-hover:text-mint" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <StateIcon aria-hidden="true" className={item.done ? "h-4 w-4 shrink-0 text-mint" : "h-4 w-4 shrink-0 text-slate-600"} />
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
