import { prisma } from "./db";

export async function logActivity(input: {
  type: string;
  message: string;
  capsuleId?: string | null;
  projectId?: string | null;
  platform?: string | null;
  metadata?: unknown;
}) {
  return prisma.activity.create({
    data: {
      type: input.type,
      message: input.message,
      capsuleId: input.capsuleId ?? null,
      projectId: input.projectId ?? null,
      platform: input.platform ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null
    }
  });
}
