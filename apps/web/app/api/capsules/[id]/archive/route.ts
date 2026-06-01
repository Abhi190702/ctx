import { archiveCapsule } from "@/lib/capsules";
import { handleRouteError, ok } from "@/lib/api-response";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    return ok(await archiveCapsule(params.id, body.archived !== false));
  } catch (error) {
    return handleRouteError(error);
  }
}
