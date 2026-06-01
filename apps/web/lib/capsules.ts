import {
  CapsuleSchema,
  CreateCapsuleSchema,
  UpdateCapsuleSchema,
  detectPlatformFromUrl,
  estimateTokens,
  formatCapsuleForInjection,
  linesToArray,
  normalizeTags,
  redactSecrets,
  safeJsonParseArray,
  serializeList,
  type CreateCapsuleInput,
  type PortableCapsule,
  type UpdateCapsuleInput
} from "@ctx/core";
import { prisma } from "./db";
import { logActivity } from "./activity";
import { buildQuickCapsuleInput } from "./capsule-intelligence";

export function toPortableCapsule(capsule: any): PortableCapsule {
  return CapsuleSchema.parse({
    schemaVersion: capsule.schemaVersion,
    id: capsule.id,
    title: capsule.title,
    description: capsule.description,
    source: {
      type: capsule.sourceType ?? "manual",
      platform: capsule.platform ?? undefined,
      url: normalizeSourceUrl(capsule.sourceUrl) ?? undefined,
      capturedAt: capsule.createdAt.toISOString()
    },
    project: capsule.project
      ? {
          name: capsule.project.name,
          repository: capsule.project.repository ?? undefined
        }
      : undefined,
    summary: capsule.summary,
    goals: safeJsonParseArray(capsule.goals),
    decisions: safeJsonParseArray(capsule.decisions),
    constraints: safeJsonParseArray(capsule.constraints),
    openQuestions: safeJsonParseArray(capsule.openQuestions),
    nextSteps: safeJsonParseArray(capsule.nextSteps),
    tags: safeJsonParseArray(capsule.tags),
    content: {
      rawText: capsule.rawText ?? "",
      markdown: capsule.markdown ?? ""
    },
    metadata: {
      createdAt: capsule.createdAt.toISOString(),
      updatedAt: capsule.updatedAt.toISOString(),
      version: capsule.versions?.length ? capsule.versions.length : 1,
      tokenEstimate: capsule.tokenEstimate,
      importance: capsule.importance
    }
  });
}

function buildData(input: CreateCapsuleInput | UpdateCapsuleInput) {
  const rawText = redactSecrets(input.rawText ?? "");
  const markdown = redactSecrets(input.markdown ?? "");
  const summary = redactSecrets(input.summary ?? "");
  const sourceUrl = normalizeSourceUrl(input.sourceUrl);
  const platform = input.platform || detectPlatformFromUrl(sourceUrl);

  return {
    title: input.title ?? "Untitled Capsule",
    description: input.description ?? null,
    summary: summary || null,
    rawText: rawText || null,
    markdown: markdown || null,
    platform,
    sourceUrl,
    sourceType: input.sourceType || "manual",
    goals: serializeList(input.goals),
    decisions: serializeList(input.decisions),
    constraints: serializeList(input.constraints),
    openQuestions: serializeList(input.openQuestions),
    nextSteps: serializeList(input.nextSteps),
    tags: JSON.stringify(normalizeTags(input.tags)),
    importance: input.importance ?? 0,
    tokenEstimate: estimateTokens([summary, rawText, markdown, linesToArray(input.goals).join(" ")].join("\n"))
  };
}

export function normalizeSourceUrl(url: string | null | undefined) {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

async function resolveProject(input: CreateCapsuleInput | UpdateCapsuleInput) {
  if (input.projectId) return input.projectId;
  if (!input.projectName) return null;

  const project = await prisma.project.upsert({
    where: { name: input.projectName },
    update: {
      repository: input.repository || undefined
    },
    create: {
      name: input.projectName,
      repository: input.repository || null
    }
  });

  return project.id;
}

export async function listCapsules() {
  return listCapsulesByStatus();
}

export async function listCapsulesByStatus(options: { status?: "active" | "archived" | "all" } = {}) {
  const status = options.status ?? "active";
  return prisma.capsule.findMany({
    where: status === "all" ? undefined : { status },
    include: { project: true, versions: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getCapsule(id: string) {
  return prisma.capsule.findUnique({
    where: { id },
    include: {
      project: true,
      versions: { orderBy: { version: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 }
    }
  });
}

export async function createCapsule(input: unknown, changeNote = "Capsule created") {
  const parsed = CreateCapsuleSchema.parse(input);
  const projectId = await resolveProject(parsed);
  const capsule = await prisma.capsule.create({
    data: {
      ...buildData(parsed),
      projectId
    },
    include: { project: true, versions: true }
  });

  const portable = toPortableCapsule(capsule);
  await prisma.capsuleVersion.create({
    data: {
      capsuleId: capsule.id,
      version: 1,
      snapshot: JSON.stringify(portable, null, 2),
      changeNote
    }
  });
  await logActivity({
    type: "capsule_created",
    capsuleId: capsule.id,
    projectId,
    platform: capsule.platform,
    message: `Created capsule "${capsule.title}"`
  });

  return getCapsule(capsule.id);
}

export async function createQuickCapsule(input: unknown) {
  const draft = buildQuickCapsuleInput(input as Parameters<typeof buildQuickCapsuleInput>[0]);
  return createCapsule(draft, "Generated from quick capture");
}

export async function updateCapsule(id: string, input: unknown, changeNote = "Capsule updated") {
  const parsed = UpdateCapsuleSchema.parse(input);
  const existing = await getCapsule(id);
  if (!existing) throw new Error("Capsule not found.");

  const projectId = await resolveProject(parsed);
  const data = buildData({ ...existing, ...parsed } as UpdateCapsuleInput);
  const capsule = await prisma.capsule.update({
    where: { id },
    data: {
      ...data,
      projectId: projectId ?? existing.projectId
    },
    include: { project: true, versions: true }
  });

  const version = existing.versions.length + 1;
  await prisma.capsuleVersion.create({
    data: {
      capsuleId: capsule.id,
      version,
      snapshot: JSON.stringify(toPortableCapsule(capsule), null, 2),
      changeNote
    }
  });
  await logActivity({
    type: "capsule_updated",
    capsuleId: capsule.id,
    projectId: capsule.projectId,
    platform: capsule.platform,
    message: `Updated capsule "${capsule.title}"`
  });

  return getCapsule(id);
}

export async function archiveCapsule(id: string, archived = true) {
  const capsule = await prisma.capsule.update({
    where: { id },
    data: { status: archived ? "archived" : "active" },
    include: { project: true, versions: true }
  });

  await logActivity({
    type: archived ? "capsule_archived" : "capsule_restored",
    capsuleId: capsule.id,
    projectId: capsule.projectId,
    platform: capsule.platform,
    message: `${archived ? "Archived" : "Restored"} capsule "${capsule.title}"`
  });

  return getCapsule(id);
}

export async function restoreCapsuleVersion(id: string, versionId: string) {
  const version = await prisma.capsuleVersion.findFirst({
    where: { id: versionId, capsuleId: id }
  });
  if (!version) throw new Error("Capsule version not found.");

  const snapshot = CapsuleSchema.parse(JSON.parse(version.snapshot));
  return updateCapsule(
    id,
    {
      title: snapshot.title,
      description: snapshot.description,
      summary: snapshot.summary,
      platform: snapshot.source?.platform,
      sourceUrl: snapshot.source?.url,
      sourceType: snapshot.source?.type,
      projectName: snapshot.project?.name,
      repository: snapshot.project?.repository,
      goals: snapshot.goals,
      decisions: snapshot.decisions,
      constraints: snapshot.constraints,
      openQuestions: snapshot.openQuestions,
      nextSteps: snapshot.nextSteps,
      tags: snapshot.tags,
      rawText: snapshot.content.rawText,
      markdown: snapshot.content.markdown,
      importance: snapshot.metadata.importance
    },
    `Restored version ${version.version}`
  );
}

export async function bulkUpdateCapsules(input: { ids: string[]; action: "archive" | "restore" | "delete" }) {
  const ids = [...new Set(input.ids)].filter(Boolean);
  if (!ids.length) throw new Error("Select at least one capsule.");

  const capsules = await prisma.capsule.findMany({ where: { id: { in: ids } } });
  if (!capsules.length) throw new Error("No matching capsules found.");

  if (input.action === "delete") {
    await Promise.all(
      capsules.map((capsule) =>
        logActivity({
          type: "capsule_deleted",
          platform: capsule.platform,
          message: `Deleted capsule "${capsule.title}" via bulk cleanup`
        })
      )
    );
    await prisma.capsule.deleteMany({ where: { id: { in: capsules.map((capsule) => capsule.id) } } });
    return { action: input.action, count: capsules.length };
  }

  const status = input.action === "archive" ? "archived" : "active";
  await prisma.capsule.updateMany({ where: { id: { in: capsules.map((capsule) => capsule.id) } }, data: { status } });
  await Promise.all(
    capsules.map((capsule) =>
      logActivity({
        type: input.action === "archive" ? "capsule_archived" : "capsule_restored",
        capsuleId: capsule.id,
        projectId: capsule.projectId,
        platform: capsule.platform,
        message: `${input.action === "archive" ? "Archived" : "Restored"} capsule "${capsule.title}" via bulk cleanup`
      })
    )
  );

  return { action: input.action, count: capsules.length };
}

export async function deleteCapsule(id: string) {
  const capsule = await prisma.capsule.delete({ where: { id } });
  await logActivity({
    type: "capsule_deleted",
    platform: capsule.platform,
    message: `Deleted capsule "${capsule.title}"`
  });
  return capsule;
}

export async function markCapsuleInjected(id: string, platform?: string) {
  const capsule = await prisma.capsule.update({
    where: { id },
    data: { lastInjectedAt: new Date() },
    include: { project: true, versions: true }
  });
  await logActivity({
    type: "capsule_injected",
    capsuleId: capsule.id,
    projectId: capsule.projectId,
    platform: platform ?? capsule.platform,
    message: `Injected capsule "${capsule.title}"`
  });
  return formatCapsuleForInjection(toPortableCapsule(capsule));
}
