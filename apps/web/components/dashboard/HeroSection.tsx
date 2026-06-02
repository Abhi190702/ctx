import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadges } from "./PlatformBadges";

export function HeroSection() {
  return (
    <section className="surface-grid mb-10 overflow-hidden rounded-3xl border border-line bg-panel p-6 shadow-glow md:p-8 lg:p-10">
      <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="min-w-0">
          <p className="mb-4 inline-flex rounded-full border border-mint/20 bg-mint-soft px-3 py-1 text-sm font-medium text-mint-dark">
            Capture once. Continue anywhere.
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-foreground text-balance md:text-5xl">
            Portable memory for AI workflows.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            Capture once. Continue anywhere. CTX turns messy AI conversations, GitHub threads, and project notes into reusable context capsules for ChatGPT, Claude, Gemini, Cursor, and MCP tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/capsules/new">
              <Button type="button">
                <Plus aria-hidden="true" className="h-4 w-4" />
                Create your first capsule
              </Button>
            </Link>
            <Link href="/github">
              <Button type="button" variant="secondary">
                View GitHub integration
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <PlatformBadges />
        </div>
        <HeroProductVisual />
      </div>
    </section>
  );
}

function HeroProductVisual() {
  const steps = ["Capture", "Capsule", "Inject"];

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-line bg-panel/85 p-3 shadow-glow backdrop-blur-xl">
      <div className="rounded-2xl border border-line bg-ink/70 p-4">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-mint/60" />
          </div>
          <span className="max-w-[12rem] truncate rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted-foreground">ctx.local/capsule</span>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-[0.85fr_1fr]">
          <div className="min-w-0 rounded-2xl border border-line bg-panel p-4">
            <p className="text-xs font-medium text-muted-foreground">Context Capsule</p>
            <h3 className="mt-2 break-words text-lg font-semibold text-foreground">Kubernetes Auto-Healing Dashboard</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Project goals, decisions, constraints, and next steps packaged into reusable memory.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["#kubernetes", "#devops", "#monitoring"].map((tag) => (
                <span key={tag} className="rounded-full bg-mint-soft px-2.5 py-1 text-xs font-medium text-mint-dark">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-line bg-panel p-4 md:flex md:flex-col md:justify-between">
            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-ink p-3 text-sm text-muted-foreground">
                Continue building this project using my CTX capsule...
              </div>
              <button className="inline-flex w-fit items-center gap-2 rounded-full border border-mint/30 bg-mint px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                CTX
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-line bg-ink px-2 py-1">{step}</span>
                  {index < steps.length - 1 ? <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
