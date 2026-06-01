import { importCapsule } from "@ctx/core";
import { createCapsule } from "./capsules";
import { inspectBackupPayload } from "./backup";
import { prisma } from "./db";

export async function importPortableCapsule(payload: unknown): Promise<unknown> {
  if (payload && typeof payload === "object" && Array.isArray((payload as { capsules?: unknown[] }).capsules)) {
    const projects = Array.isArray((payload as { projects?: unknown[] }).projects) ? (payload as { projects: any[] }).projects : [];
    for (const project of projects) {
      if (typeof project?.name === "string" && project.name.trim()) {
        await prisma.project.upsert({
          where: { name: project.name },
          update: {
            description: typeof project.description === "string" ? project.description : undefined,
            repository: typeof project.repository === "string" ? project.repository : undefined
          },
          create: {
            name: project.name,
            description: typeof project.description === "string" ? project.description : null,
            repository: typeof project.repository === "string" ? project.repository : null
          }
        });
      }
    }

    const imported = [];
    for (const capsule of (payload as { capsules: unknown[] }).capsules) {
      imported.push(await importPortableCapsule(capsule));
    }
    return {
      imported,
      inspection: inspectBackupPayload(payload)
    };
  }

  const capsule = importCapsule(payload);
  return createCapsule(
    {
      title: capsule.title,
      description: capsule.description,
      summary: capsule.summary,
      platform: capsule.source?.platform,
      sourceUrl: capsule.source?.url,
      sourceType: capsule.source?.type,
      projectName: capsule.project?.name,
      repository: capsule.project?.repository,
      goals: capsule.goals,
      decisions: capsule.decisions,
      constraints: capsule.constraints,
      openQuestions: capsule.openQuestions,
      nextSteps: capsule.nextSteps,
      tags: capsule.tags,
      rawText: capsule.content.rawText,
      markdown: capsule.content.markdown,
      importance: capsule.metadata.importance
    },
    "Imported from .ctx.json"
  );
}
