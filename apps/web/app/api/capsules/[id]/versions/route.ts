import { fail, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const capsule = await prisma.capsule.findUnique({
      where: { id: params.id },
      include: { versions: { orderBy: { version: "desc" } } }
    });
    if (!capsule) return fail("Capsule not found.", 404);
    return ok(capsule.versions);
  } catch (error) {
    return handleRouteError(error);
  }
}
