import { describe, expect, it } from "vitest";
import { estimateTokens, normalizeTags } from "@ctx/core";
import { buildQuickCapsuleInput } from "../lib/capsule-intelligence";
import { buildCapsuleReview } from "../lib/capsule-review";
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

  it("flags likely duplicate capsule drafts", () => {
    const draft = buildQuickCapsuleInput({
      text: "Project: CTX\nNeed to improve the Chrome extension drop flow and keep one-click memory reliable.",
      title: "Chrome Extension Drop Flow",
      tags: "extension,drop",
      sourceUrl: "https://github.com/Abhi190702/ctx/pull/10"
    });

    const review = buildCapsuleReview(draft, [
      {
        id: "capsule-1",
        title: "Chrome Extension Drop Flow",
        sourceUrl: "https://github.com/Abhi190702/ctx/pull/10",
        tags: "[\"extension\",\"drop\"]",
        rawText: draft.rawText
      }
    ]);

    expect(review.duplicateCandidates[0]?.id).toBe("capsule-1");
  });
});
