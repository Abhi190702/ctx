import { createCapsule, listCapsules } from "@/lib/capsules";
import { fail, handleRouteError, ok } from "@/lib/api-response";

export async function GET() {
  try {
    return ok(await listCapsules());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const capsule = await createCapsule(body);
    return ok(capsule, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
