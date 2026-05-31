import { prisma } from "./client.js";

export function listCapsules() {
  return prisma.capsule.findMany({ orderBy: { updatedAt: "desc" } });
}

export function getCapsule(id: string) {
  return prisma.capsule.findUnique({ where: { id } });
}
