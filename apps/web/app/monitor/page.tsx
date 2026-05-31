import { ActivityFeed } from "@/components/monitor/ActivityFeed";
import { CapsuleHealth } from "@/components/monitor/CapsuleHealth";
import { PlatformUsage } from "@/components/monitor/PlatformUsage";
import { RecentInjections } from "@/components/monitor/RecentInjections";
import { UsageChart } from "@/components/monitor/UsageChart";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  const stats = await getStats();

  return (
    <PageShell>
      <PageHeader
        title="Monitor"
        description="Track capsule usage, health, platform distribution, and workflow activity."
      />
      <div className="space-y-6">
        <StatsCards stats={stats} />
        <div className="grid gap-6 xl:grid-cols-2">
          <UsageChart stats={stats} />
          <PlatformUsage distribution={stats.platformDistribution} />
          <CapsuleHealth stats={stats} />
          <RecentInjections activity={stats.recentActivity} />
        </div>
        <ActivityFeed activity={stats.recentActivity} />
      </div>
    </PageShell>
  );
}
