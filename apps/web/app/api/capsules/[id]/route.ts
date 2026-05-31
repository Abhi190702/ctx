import { deleteCapsule, getCapsule, updateCapsule } from "@/lib/capsules";
import { handleRouteError, ok, fail } from "@/lib/api-response";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const capsule = await getCapsule(params.id);
    if (!capsule) return fail("Capsule not found.", 404);
    return ok(capsule);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const capsule = await updateCapsule(params.id, await request.json());
    return ok(capsule);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    return ok(await deleteCapsule(params.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
