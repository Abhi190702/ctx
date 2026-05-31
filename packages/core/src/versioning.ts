import type { PortableCapsule } from "./schema";

export function createCapsuleVersion(capsule: PortableCapsule, changeNote?: string) {
  const version = capsule.metadata.version || 1;

  return {
    capsuleId: capsule.id,
    version,
    snapshot: JSON.stringify(capsule, null, 2),
    changeNote: changeNote ?? `Captured CTX capsule version ${version}`
  };
}
