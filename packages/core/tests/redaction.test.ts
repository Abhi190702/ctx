import { describe, expect, it } from "vitest";
import { redactSecrets } from "../src";

describe("redactSecrets", () => {
  it("redacts obvious token-like strings", () => {
    const result = redactSecrets("OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz123456");
    expect(result).toContain("[REDACTED");
    expect(result).not.toContain("abcdefghijklmnopqrstuvwxyz123456");
  });

  it("redacts high-entropy credential assignments", () => {
    const result = redactSecrets("SERVICE_ACCESS_TOKEN=QWxhZGRpbjpvcGVuIHNlc2FtZTEyMzQ1Njc4OTA=");
    expect(result).toContain("[REDACTED_HIGH_ENTROPY_SECRET]");
    expect(result).not.toContain("QWxhZGRpbjpvcGVu");
  });
});
