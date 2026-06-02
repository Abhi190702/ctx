import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { TeamShareActions } from "@/components/settings/TeamShareActions";
import { Card } from "@/components/ui/card";
import { BackupActions } from "@/components/capsules/BackupActions";
import { getGitHubTokenStatus } from "@/lib/github";
import { getDatabaseIntegrity } from "@/lib/persistence";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const integrity = await getDatabaseIntegrity();
  const github = getGitHubTokenStatus();

  return (
    <PageShell>
      <PageHeader title="Settings" description="Local-first controls for API, extension, privacy, and redaction." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-foreground">API</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted">CTX App URL</dt>
              <dd className="text-foreground">{process.env.CTX_APP_URL || "http://localhost:3000"}</dd>
            </div>
            <div>
              <dt className="text-muted">CTX API URL</dt>
              <dd className="text-foreground">{process.env.CTX_API_URL || "http://localhost:3000/api"}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-foreground">Extension Configuration</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Load apps/extension/dist as an unpacked extension after running pnpm extension:dev or pnpm --filter @ctx/extension build.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-foreground">Data Export</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Back up local capsules with an integrity envelope before moving machines or resetting a database.</p>
          <div className="mt-4">
            <BackupActions />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-foreground">Persistence Health</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Database</dt>
              <dd className={integrity.ok ? "text-mint" : "text-rose"}>{integrity.ok ? "Integrity OK" : "Needs repair"}</dd>
            </div>
            <div>
              <dt className="text-muted">Stored Memory</dt>
              <dd className="text-foreground">{integrity.capsules} capsules / {integrity.projects} projects / {integrity.activities} activity rows</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-foreground">GitHub Token Status</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {github.configured
              ? `GITHUB_TOKEN is configured. CTX uses GitHub REST API ${github.apiVersion}.`
              : "GITHUB_TOKEN is not configured. Add it to .env to enable GitHub capture."}
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-foreground">MCP Server</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Run pnpm mcp:dev and point MCP clients at {process.env.CTX_API_URL || "http://localhost:3000/api"}.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-foreground">Privacy and Redaction</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            CTX stores capsules in a local SQLite database by default. Secret redaction is active in capture helpers before storage.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-foreground">Encrypted Team Share Bundles</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Export local memory as a passphrase-protected bundle for small teams, then import it on another CTX workspace.
          </p>
          <div className="mt-4">
            <TeamShareActions />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
