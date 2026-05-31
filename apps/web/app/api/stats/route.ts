import { handleRouteError, ok } from "@/lib/api-response";
import { getStats } from "@/lib/stats";

export async function GET() {
  try {
    return ok(await getStats());
  } catch (error) {
    return handleRouteError(error);
  }
}
