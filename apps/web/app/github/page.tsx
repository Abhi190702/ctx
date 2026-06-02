import { GitHubCaptureCard } from "@/components/github/GitHubCaptureCard";
import { GitHubPreview } from "@/components/github/GitHubPreview";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { getGitHubTokenStatus } from "@/lib/github";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GitHubPage() {
  const token = getGitHubTokenStatus();
  const captures = await prisma.gitHubCapture.findMany({ orderBy: { createdAt: "desc" }, take: 6 });

  return (
    <PageShell>
      <PageHeader
        title="Turn GitHub context into reusable AI memory."
        description="Capture issues, pull requests, READMEs, comments, reviews, CI checks, and repository metadata as structured CTX capsules."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <GitHubCaptureCard tokenConfigured={token.configured} />
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-foreground">Token Status</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {token.configured
                ? "GITHUB_TOKEN is configured. CTX will use the official GitHub REST API with the 2022-11-28 API version."
                : "GITHUB_TOKEN is not configured. Add it to .env to enable real GitHub capture."}
            </p>
          </Card>
          <GitHubPreview />
          <Card>
            <h2 className="text-lg font-semibold text-foreground">Recent GitHub Captures</h2>
            <div className="mt-4 space-y-3">
              {captures.map((capture) => (
                <a
                  key={capture.id}
                  href={capture.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-line bg-ink p-3 transition-colors hover:border-mint/40"
                >
                  <p className="text-sm font-medium text-foreground">{capture.title}</p>
                  <p className="mt-1 text-xs text-muted">{capture.owner}/{capture.repo} / {capture.type} / {formatDateTime(capture.createdAt)}</p>
                </a>
              ))}
              {!captures.length ? <p className="text-sm leading-6 text-muted-foreground">GitHub captures will appear here after you create them.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
