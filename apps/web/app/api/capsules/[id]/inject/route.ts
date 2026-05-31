import { markCapsuleInjected } from "@/lib/capsules";
import { handleRouteError, ok } from "@/lib/api-response";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = await markCapsuleInjected(params.id, body.platform);
    return ok({ text });
  } catch (error) {
    return handleRouteError(error);
  }
}
