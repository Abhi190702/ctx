import { Activity, Boxes, Github, Network } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatsCards({ stats }: { stats: any }) {
  const cards = [
    { label: "Total Capsules", value: stats.totalCapsules, icon: Boxes, tone: "text-mint" },
    { label: "Projects", value: stats.totalProjects, icon: Network, tone: "text-sky" },
    { label: "Injections", value: stats.totalInjections, icon: Activity, tone: "text-amber" },
    { label: "GitHub Captures", value: stats.githubCaptures ?? 0, icon: Github, tone: "text-rose" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
              </div>
              <Icon aria-hidden="true" className={`h-6 w-6 ${card.tone}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
