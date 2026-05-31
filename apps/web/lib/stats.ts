import { safeJsonParseArray } from "@ctx/core";
import { prisma } from "./db";

export async function getStats() {
  const [capsules, projects, activities] = await Promise.all([
    prisma.capsule.findMany({
      include: { project: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.project.findMany({ include: { capsules: true } }),
    prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 25 })
  ]);

  const injections = activities.filter((activity) => activity.type === "capsule_injected").length;
  const platformDistribution = capsules.reduce<Record<string, number>>((acc, capsule) => {
    const key = capsule.platform ?? "manual";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const missingSummary = capsules.filter((capsule) => !capsule.summary).length;
  const noTags = capsules.filter((capsule) => safeJsonParseArray(capsule.tags).length === 0).length;
  const highToken = capsules.filter((capsule) => capsule.tokenEstimate > 1800).length;
  const staleDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const stale = capsules.filter((capsule) => capsule.updatedAt < staleDate).length;

  return {
    totalCapsules: capsules.length,
    totalProjects: projects.length,
    totalInjections: injections,
    supportedPlatforms: 8,
    highTokenCapsules: highToken,
    capsulesMissingSummary: missingSummary,
    capsulesWithoutTags: noTags,
    staleCapsules: stale,
    platformDistribution,
    recentCapsules: capsules.slice(0, 6),
    recentActivity: activities,
    projects
  };
}
