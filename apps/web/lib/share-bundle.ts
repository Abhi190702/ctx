import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";
const digest = "sha256";
const iterations = 210_000;
const keyLength = 32;
const shareVersion = "0.1.0";

export type EncryptedShareBundle = {
  kind: "ctx.encrypted-share";
  ctxShareVersion: string;
  createdAt: string;
  team: {
    name: string;
    createdBy?: string | null;
  };
  policy: {
    roles: string[];
    redaction: string;
    importReview: string;
  };
  encryption: {
    algorithm: typeof algorithm;
    kdf: "pbkdf2";
    digest: typeof digest;
    iterations: number;
    salt: string;
    iv: string;
    tag: string;
  };
  integrity: {
    ciphertextChecksum: string;
  };
  payload: string;
};

export function createEncryptedShareBundle(input: {
  payload: unknown;
  passphrase: string;
  teamName?: string;
  createdBy?: string | null;
}) {
  assertPassphrase(input.passphrase);
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(input.passphrase, salt);
  const cipher = createCipheriv(algorithm, key, iv);
  const plaintext = JSON.stringify(input.payload);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = ciphertext.toString("base64");

  return {
    kind: "ctx.encrypted-share" as const,
    ctxShareVersion: shareVersion,
    createdAt: new Date().toISOString(),
    team: {
      name: input.teamName?.trim() || "Shared CTX Workspace",
      createdBy: input.createdBy?.trim() || null
    },
    policy: {
      roles: ["reader", "editor", "admin"],
      redaction: "Apply CTX redaction before exporting sensitive source text.",
      importReview: "Review imported capsules before re-sharing them with another workspace."
    },
    encryption: {
      algorithm,
      kdf: "pbkdf2" as const,
      digest,
      iterations,
      salt: salt.toString("base64"),
      iv: iv.toString("base64"),
      tag: tag.toString("base64")
    },
    integrity: {
      ciphertextChecksum: checksum(payload)
    },
    payload
  };
}

export function decryptShareBundle(bundle: unknown, passphrase: string) {
  assertPassphrase(passphrase);
  const parsed = assertBundle(bundle);
  if (parsed.integrity.ciphertextChecksum !== checksum(parsed.payload)) {
    throw new Error("Share bundle checksum does not match. Ask for a fresh export.");
  }

  const key = deriveKey(passphrase, Buffer.from(parsed.encryption.salt, "base64"));
  const decipher = createDecipheriv(parsed.encryption.algorithm, key, Buffer.from(parsed.encryption.iv, "base64"));
  decipher.setAuthTag(Buffer.from(parsed.encryption.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(parsed.payload, "base64")),
    decipher.final()
  ]).toString("utf8");

  return JSON.parse(plaintext) as unknown;
}

export function inspectShareBundle(bundle: unknown) {
  const parsed = assertBundle(bundle);
  return {
    kind: parsed.kind,
    ctxShareVersion: parsed.ctxShareVersion,
    createdAt: parsed.createdAt,
    teamName: parsed.team.name,
    createdBy: parsed.team.createdBy,
    encrypted: true,
    algorithm: parsed.encryption.algorithm,
    checksumValid: parsed.integrity.ciphertextChecksum === checksum(parsed.payload),
    policy: parsed.policy
  };
}

function deriveKey(passphrase: string, salt: Buffer) {
  return pbkdf2Sync(passphrase, salt, iterations, keyLength, digest);
}

function checksum(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function assertPassphrase(passphrase: string) {
  if (typeof passphrase !== "string" || passphrase.length < 8) {
    throw new Error("Share bundle passphrase must be at least 8 characters.");
  }
}

function assertBundle(bundle: unknown): EncryptedShareBundle {
  if (!bundle || typeof bundle !== "object") throw new Error("Invalid CTX share bundle.");
  const candidate = bundle as EncryptedShareBundle;
  if (candidate.kind !== "ctx.encrypted-share") throw new Error("This is not an encrypted CTX share bundle.");
  if (!candidate.payload || typeof candidate.payload !== "string") throw new Error("Share bundle payload is missing.");
  if (candidate.encryption?.algorithm !== algorithm) throw new Error("Unsupported share bundle encryption algorithm.");
  if (candidate.encryption?.kdf !== "pbkdf2") throw new Error("Unsupported share bundle key derivation.");
  return candidate;
}
