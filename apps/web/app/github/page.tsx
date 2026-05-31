import { GitHubCaptureCard } from "@/components/github/GitHubCaptureCard";
import { GitHubPreview } from "@/components/github/GitHubPreview";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { getGitHubTokenStatus } from "@/lib/github";

export const dynamic = "force-dynamic";

export default function GitHubPage() {
  const token = getGitHubTokenStatus();

  return (
    <PageShell>
      <PageHeader
        title="GitHub Capture"
        description="Turn GitHub issues, pull requests, READMEs, and repository metadata into reusable AI memory."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <GitHubCaptureCard tokenConfigured={token.configured} />
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-white">Token Status</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {token.configured
                ? "GITHUB_TOKEN is configured. CTX will use the official GitHub REST API with the 2022-11-28 API version."
                : "GITHUB_TOKEN is not configured. Add it to .env to enable real GitHub capture."}
            </p>
          </Card>
          <GitHubPreview />
        </div>
      </div>
    </PageShell>
  );
}
