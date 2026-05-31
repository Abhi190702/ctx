import { describe, expect, it } from "vitest";
import { estimateTokens, normalizeTags } from "@ctx/core";
import { buildQuickCapsuleInput } from "../lib/capsule-intelligence";
import { normalizeSourceUrl } from "../lib/capsules";

describe("capsule helpers", () => {
  it("normalizes tags", () => {
    expect(normalizeTags("GitHub, Pull Request, github")).toEqual(["github", "pull-request"]);
  });

  it("estimates tokens", () => {
    expect(estimateTokens("one two three")).toBeGreaterThan(0);
  });

  it("normalizes invalid source URLs before storage", () => {
    expect(normalizeSourceUrl("not a url")).toBeNull();
    expect(normalizeSourceUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeSourceUrl(" https://github.com/Abhi190702/ctx ")).toBe("https://github.com/Abhi190702/ctx");
  });

  it("does not expose invalid source URLs in quick drafts", () => {
    const draft = buildQuickCapsuleInput({
      text: "Project: CTX\nNeed to keep capsule previews stable and safe.",
      sourceUrl: "not a url"
    });

    expect(draft.sourceUrl).toBe("");
  });
});
