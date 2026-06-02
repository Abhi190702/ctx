import { z } from "zod";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { exportCapsules } from "@/lib/export";
import { createEncryptedShareBundle } from "@/lib/share-bundle";

const ShareExportSchema = z.object({
  passphrase: z.string().min(8),
  teamName: z.string().optional(),
  createdBy: z.string().optional(),
  capsuleId: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const input = ShareExportSchema.parse(await request.json());
    const payload = await exportCapsules(input.capsuleId);
    return ok(
      createEncryptedShareBundle({
        payload,
        passphrase: input.passphrase,
        teamName: input.teamName,
        createdBy: input.createdBy
      }),
    );
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
