import { safeJsonParseArray } from "@ctx/core";
import { prisma } from "./db";

export async function searchCapsules(query: string) {
  const q = query.trim().toLowerCase();
  const capsules = await prisma.capsule.findMany({
    include: { project: true, versions: true },
    orderBy: { updatedAt: "desc" }
  });

  if (!q) return capsules;

  return capsules.filter((capsule) => {
    const tags = safeJsonParseArray(capsule.tags).join(" ");
    const haystack = [
      capsule.title,
      capsule.description,
      capsule.summary,
      capsule.rawText,
      capsule.markdown,
      capsule.platform,
      capsule.sourceUrl,
      tags,
      capsule.project?.name
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
