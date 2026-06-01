import { getDatabaseIntegrity } from "@/lib/persistence";
import { handleRouteError, ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getDatabaseIntegrity());
  } catch (error) {
    return handleRouteError(error);
  }
}
