import { fail, handleRouteError, ok } from "@/lib/api-response";
import { importPortableCapsule } from "@/lib/import";

export async function POST(request: Request) {
  try {
    return ok(await importPortableCapsule(await request.json()), { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
