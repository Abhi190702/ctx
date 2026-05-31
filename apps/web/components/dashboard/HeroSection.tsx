import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadges } from "./PlatformBadges";
import { WorkflowPreview } from "./WorkflowPreview";

export function HeroSection() {
  return (
    <section className="mb-8 overflow-hidden rounded-lg border border-line bg-panel p-6 shadow-glow md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-medium text-mint">Capture once. Continue anywhere.</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-white text-balance md:text-6xl">
            Portable memory for AI workflows
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Capture, organize, and reuse context across ChatGPT, Claude, Gemini, Cursor, GitHub, and MCP-compatible tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/capsules/new">
              <Button type="button">
                <Plus aria-hidden="true" className="h-4 w-4" />
                Create Capsule
              </Button>
            </Link>
            <Link href="/monitor">
              <Button type="button" variant="secondary">
                View Dashboard
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <PlatformBadges />
        </div>
        <WorkflowPreview />
      </div>
    </section>
  );
}
