import { describe, expect, it } from "vitest";
import { estimateTokens, normalizeTags } from "@ctx/core";

describe("capsule helpers", () => {
  it("normalizes tags", () => {
    expect(normalizeTags("GitHub, Pull Request, github")).toEqual(["github", "pull-request"]);
  });

  it("estimates tokens", () => {
    expect(estimateTokens("one two three")).toBeGreaterThan(0);
  });
});
