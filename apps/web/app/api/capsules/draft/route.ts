import { buildQuickCapsuleInput } from "@/lib/capsule-intelligence";
import { fail, handleRouteError, ok } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    return ok(buildQuickCapsuleInput(await request.json()));
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
