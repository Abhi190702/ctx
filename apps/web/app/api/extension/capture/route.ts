import { createQuickCapsule } from "@/lib/capsules";
import { fail, handleRouteError, ok } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const capsule = await createQuickCapsule({ ...body, sourceType: "browser_extension" });
    return ok(capsule, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
