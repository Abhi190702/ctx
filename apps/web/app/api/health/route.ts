import { ok } from "@/lib/api-response";

export function GET() {
  return ok({
    status: "ok",
    name: "CTX",
    version: "0.1.0",
    checkedAt: new Date().toISOString()
  });
}
