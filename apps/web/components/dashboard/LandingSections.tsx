import Link from "next/link";
import { ArrowRight, Boxes, Database, Github, Globe, LineChart, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  { title: "Context Capsules", description: "Turn long conversations into structured goals, decisions, constraints, and next steps.", icon: Boxes },
  { title: "Browser CTX Button", description: "Capture and drop memory from the chat bar where work already happens.", icon: Globe },
  { title: "GitHub to Capsule", description: "Preserve issues, PR reviews, CI failures, README context, and repo notes.", icon: Github },
  { title: "MCP Server", description: "Expose saved memory to Claude Desktop, Cursor, and other MCP-compatible clients.", icon: PlugZap },
  { title: "Local-first Storage", description: "Keep context inspectable in your own SQLite database with export and restore.", icon: Database },
  { title: "Monitoring Dashboard", description: "Track usage, health, high-token capsules, missing summaries, and reuse.", icon: LineChart }
];

export function LandingSections() {
  return (
    <div className="space-y-10">
      <section className="grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm font-medium text-mint-dark">Problem</p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">AI tools forget your project context.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Useful decisions get buried in chats, PR threads, notes, and terminal logs. Every new tool starts cold unless you manually rebuild the context.
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-mint-dark">Solution</p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">CTX gives your work portable memory.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Capture once, review the capsule, and inject the exact memory into ChatGPT, Claude, Gemini, Cursor, GitHub workflows, or MCP tools.
          </p>
        </Card>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-foreground">Built for daily developer workflows.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">No spectacle. Just reusable context where it matters.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-5 transition-colors hover:border-mint/40">
                <Icon aria-hidden="true" className="h-5 w-5 text-mint" />
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-panel p-6 shadow-glow md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Workflow</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {["ChatGPT / Claude / GitHub", "CTX Capture", "Structured Capsule", "Inject Anywhere"].map((step, index) => (
            <div key={step} className="rounded-2xl border border-line bg-ink p-4">
              <span className="text-xs font-semibold text-mint-dark">0{index + 1}</span>
              <p className="mt-3 text-sm font-medium text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-line bg-ink p-6 md:flex-row md:items-center md:p-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Open-source, local-first infrastructure.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            CTX is designed to be inspectable, hackable, and serious enough for real project memory.
          </p>
        </div>
        <Link href="/capsules/new" className="shrink-0">
          <Button type="button">
            Create your first capsule
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
