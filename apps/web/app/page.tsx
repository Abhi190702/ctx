import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentCapsules } from "@/components/dashboard/RecentCapsules";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PageShell } from "@/components/layout/PageShell";
import { getGitHubTokenStatus } from "@/lib/github";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await getStats();
  const githubStatus = getGitHubTokenStatus();

  return (
    <PageShell>
      <HeroSection />
      <DashboardHeader />
      <div className="space-y-6">
        <StatsCards stats={stats} />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Recent Capsules</h2>
            <RecentCapsules capsules={stats.recentCapsules} />
          </section>
          <aside className="space-y-6">
            <OnboardingChecklist stats={stats} githubConfigured={githubStatus.configured} />
            <QuickActions />
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
