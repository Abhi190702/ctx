import { z } from "zod";
import { bulkUpdateCapsules } from "@/lib/capsules";
import { fail, handleRouteError, ok } from "@/lib/api-response";

const BulkCapsuleSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["archive", "restore", "delete"])
});

export async function POST(request: Request) {
  try {
    const input = BulkCapsuleSchema.parse(await request.json());
    return ok(await bulkUpdateCapsules(input));
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
