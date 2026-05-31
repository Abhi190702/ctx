import { exportCapsules } from "@/lib/export";
import { handleRouteError, ok } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return ok(await exportCapsules(url.searchParams.get("id")));
  } catch (error) {
    return handleRouteError(error);
  }
}
