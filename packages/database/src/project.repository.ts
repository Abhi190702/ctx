import { prisma } from "./client.js";

export function listProjects() {
  return prisma.project.findMany({ include: { capsules: true }, orderBy: { updatedAt: "desc" } });
}
