import { importCapsule } from "@ctx/core";
import { createCapsule } from "./capsules";

export async function importPortableCapsule(payload: unknown): Promise<unknown> {
  if (payload && typeof payload === "object" && Array.isArray((payload as { capsules?: unknown[] }).capsules)) {
    const imported = [];
    for (const capsule of (payload as { capsules: unknown[] }).capsules) {
      imported.push(await importPortableCapsule(capsule));
    }
    return imported;
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
