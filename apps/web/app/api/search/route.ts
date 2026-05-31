import { ok, handleRouteError } from "@/lib/api-response";
import { searchCapsules } from "@/lib/search";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    return ok(await searchCapsules(query));
  } catch (error) {
    return handleRouteError(error);
  }
}
