import { createHash } from "node:crypto";

type BackupEnvelope = {
  schemaVersion: string;
  exportedAt: string;
  integrity?: {
    checksum?: string;
    capsuleCount?: number;
    projectCount?: number;
  };
  capsules?: unknown[];
  projects?: unknown[];
};

export function buildBackupEnvelope(input: { schemaVersion: string; exportedAt: string; capsules: unknown[]; projects: unknown[] }) {
  const checksum = checksumCapsules(input.capsules);
  return {
    ...input,
    integrity: {
      checksum,
      capsuleCount: input.capsules.length,
      projectCount: input.projects.length
    }
  };
}

export function inspectBackupPayload(payload: unknown) {
  const envelope = isBackupEnvelope(payload) ? payload : null;
  const capsules = Array.isArray(envelope?.capsules) ? envelope.capsules : payload ? [payload] : [];
  const expectedChecksum = envelope?.integrity?.checksum;
  const actualChecksum = checksumCapsules(capsules);

  return {
    isBundle: Boolean(envelope),
    schemaVersion: envelope?.schemaVersion ?? "single-capsule",
    capsuleCount: capsules.length,
    projectCount: Array.isArray(envelope?.projects) ? envelope.projects.length : 0,
    exportedAt: envelope?.exportedAt ?? null,
    checksum: actualChecksum,
    checksumValid: expectedChecksum ? expectedChecksum === actualChecksum : null
  };
}

export function checksumCapsules(capsules: unknown[]) {
  return createHash("sha256").update(JSON.stringify(capsules)).digest("hex");
}

function isBackupEnvelope(payload: unknown): payload is BackupEnvelope {
  return Boolean(payload && typeof payload === "object" && Array.isArray((payload as BackupEnvelope).capsules));
}
