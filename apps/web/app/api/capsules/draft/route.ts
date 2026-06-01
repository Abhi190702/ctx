import { buildQuickCapsuleInput } from "@/lib/capsule-intelligence";
import { buildCapsuleReview } from "@/lib/capsule-review";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const draft = buildQuickCapsuleInput(await request.json());
    const recentCapsules = await prisma.capsule.findMany({
      select: {
        id: true,
        title: true,
        summary: true,
        rawText: true,
        sourceUrl: true,
        tags: true,
        project: { select: { name: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 75
    });

    return ok({
      ...draft,
      review: buildCapsuleReview(draft, recentCapsules)
    });
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
