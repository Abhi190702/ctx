import { z } from "zod";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { importPortableCapsule } from "@/lib/import";
import { decryptShareBundle, inspectShareBundle } from "@/lib/share-bundle";

const ShareImportSchema = z.object({
  passphrase: z.string().min(8),
  bundle: z.unknown()
});

export async function POST(request: Request) {
  try {
    const input = ShareImportSchema.parse(await request.json());
    const inspection = inspectShareBundle(input.bundle);
    if (!inspection.checksumValid) throw new Error("Share bundle checksum does not match. Ask for a fresh export.");
    const payload = decryptShareBundle(input.bundle, input.passphrase);
    return ok({ imported: await importPortableCapsule(payload), inspection }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    return handleRouteError(error);
  }
}
