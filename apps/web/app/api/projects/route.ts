import { ProjectSchema } from "@ctx/core";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { capsules: true },
      orderBy: { updatedAt: "desc" }
    });
    return ok(projects);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = ProjectSchema.parse(await request.json());
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        repository: input.repository ?? null
      }
    });
    await logActivity({
      type: "project_created",
      projectId: project.id,
      message: `Created project "${project.name}"`
    });
    return ok(project, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
