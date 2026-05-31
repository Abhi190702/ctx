import { describe, expect, it } from "vitest";
import { redactSecrets } from "../src";

describe("redactSecrets", () => {
  it("redacts obvious token-like strings", () => {
    const result = redactSecrets("OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz123456");
    expect(result).toContain("[REDACTED");
    expect(result).not.toContain("abcdefghijklmnopqrstuvwxyz123456");
  });
});
