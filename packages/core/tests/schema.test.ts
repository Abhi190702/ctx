import { describe, expect, it } from "vitest";
import { CapsuleSchema, GitHubCaptureSchema } from "../src";

describe("schemas", () => {
  it("accepts a portable capsule", () => {
    const capsule = CapsuleSchema.parse({
      title: "Portable memory",
      summary: "A reusable AI context capsule."
    });

    expect(capsule.schemaVersion).toBe("0.1.0");
    expect(capsule.content.rawText).toBe("");
  });

  it("requires a number for issue captures", () => {
    expect(() => GitHubCaptureSchema.parse({ owner: "openai", repo: "ctx", type: "issue" })).toThrow();
  });
});
