import { CapsuleSchema, type PortableCapsule } from "./schema";

export function exportCapsule(capsule: PortableCapsule): PortableCapsule {
  return CapsuleSchema.parse(capsule);
}

export function importCapsule(json: string | unknown): PortableCapsule {
  const payload = typeof json === "string" ? JSON.parse(json) : json;
  return CapsuleSchema.parse(payload);
}
