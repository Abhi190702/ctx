import { restoreCapsuleVersion } from "@/lib/capsules";
import { handleRouteError, ok } from "@/lib/api-response";

export async function POST(_request: Request, { params }: { params: { id: string; versionId: string } }) {
  try {
    return ok(await restoreCapsuleVersion(params.id, params.versionId));
  } catch (error) {
    return handleRouteError(error);
  }
}
