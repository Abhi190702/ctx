import { toPortableCapsule } from "./capsules";
import { prisma } from "./db";
import { logActivity } from "./activity";

export async function exportCapsules(id?: string | null) {
  if (id) {
    const capsule = await prisma.capsule.findUnique({
      where: { id },
      include: { project: true, versions: true }
    });
    if (!capsule) throw new Error("Capsule not found.");
    await logActivity({
      type: "capsule_exported",
      capsuleId: capsule.id,
      projectId: capsule.projectId,
      platform: capsule.platform,
      message: `Exported capsule "${capsule.title}"`
    });
    return toPortableCapsule(capsule);
  }

  const capsules = await prisma.capsule.findMany({
    include: { project: true, versions: true },
    orderBy: { updatedAt: "desc" }
  });

  return {
    schemaVersion: "0.1.0",
    exportedAt: new Date().toISOString(),
    capsules: capsules.map(toPortableCapsule)
  };
}
