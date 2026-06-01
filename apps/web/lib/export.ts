import { toPortableCapsule } from "./capsules";
import { prisma } from "./db";
import { logActivity } from "./activity";
import { buildBackupEnvelope } from "./backup";

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
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
  const portableCapsules = capsules.map(toPortableCapsule);

  return buildBackupEnvelope({
    schemaVersion: "0.1.0",
    exportedAt: new Date().toISOString(),
    projects,
    capsules: portableCapsules
  });
}
