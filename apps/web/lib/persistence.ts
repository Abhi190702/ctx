import { prisma } from "./db";

export async function getDatabaseIntegrity() {
  const [capsules, projects, activities, integrityRows] = await Promise.all([
    prisma.capsule.count(),
    prisma.project.count(),
    prisma.activity.count(),
    prisma.$queryRawUnsafe<Array<Record<string, string>>>("PRAGMA integrity_check")
  ]);

  const values = integrityRows.flatMap((row) => Object.values(row));
  return {
    ok: values.length > 0 && values.every((value) => value === "ok"),
    checks: values,
    capsules,
    projects,
    activities,
    checkedAt: new Date().toISOString()
  };
}
