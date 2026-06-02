import { fail, handleRouteError, ok } from "@/lib/api-response";
import { inspectShareBundle } from "@/lib/share-bundle";

export async function POST(request: Request) {
  try {
    return ok(inspectShareBundle(await request.json()));
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
