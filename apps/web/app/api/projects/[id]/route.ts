import { fail, handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { capsules: { orderBy: { updatedAt: "desc" } } }
    });
    if (!project) return fail("Project not found.", 404);
    return ok(project);
  } catch (error) {
    return handleRouteError(error);
  }
}
