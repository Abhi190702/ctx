import { prisma } from "./client.js";

export function listGitHubCaptures() {
  return prisma.gitHubCapture.findMany({ orderBy: { createdAt: "desc" } });
}
