import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { getDatabaseIntegrity } from "@/lib/persistence";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const integrity = await getDatabaseIntegrity();

  return (
    <PageShell>
      <PageHeader title="Settings" description="Local-first controls for API, extension, privacy, and redaction." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-white">API</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">CTX App URL</dt>
              <dd className="text-slate-200">{process.env.CTX_APP_URL || "http://localhost:3000"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">CTX API URL</dt>
              <dd className="text-slate-200">{process.env.CTX_API_URL || "http://localhost:3000/api"}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Privacy</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            CTX stores capsules in a local SQLite database by default. Secret redaction is enabled in capture helpers and will expand with entropy scoring in later releases.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Extension Status</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Load apps/extension/dist as an unpacked extension after running pnpm extension:dev or pnpm --filter @ctx/extension build.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Persistence Health</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Database</dt>
              <dd className={integrity.ok ? "text-mint" : "text-rose"}>{integrity.ok ? "Integrity OK" : "Needs repair"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Stored Memory</dt>
              <dd className="text-slate-200">{integrity.capsules} capsules · {integrity.projects} projects · {integrity.activities} activity rows</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Redaction Toggle</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Placeholder setting: redaction is currently always active for API captures. A UI switch can be added once per-workspace policies exist.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
