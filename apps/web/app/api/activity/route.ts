import { handleRouteError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const activity = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return ok(activity);
  } catch (error) {
    return handleRouteError(error);
  }
}
