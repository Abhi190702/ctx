import { prisma } from "./client.js";

export function listRecentActivity(limit = 50) {
  return prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}
