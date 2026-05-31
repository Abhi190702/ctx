import { describe, expect, it } from "vitest";
import { safeJsonParseArray } from "@ctx/core";
import { scoreCapsuleForSearch } from "../lib/search";

describe("search data helpers", () => {
  it("parses json tags", () => {
    expect(safeJsonParseArray("[\"github\",\"ctx\"]")).toEqual(["github", "ctx"]);
  });

  it("scores semantic aliases", () => {
    const score = scoreCapsuleForSearch(
      {
        title: "GitHub PR Review Memory",
        summary: "Preserves review comments and follow-up tests.",
        tags: "[\"github\",\"review\"]",
        project: { name: "ctx" }
      },
      "pull request feedback"
    );

    expect(score).toBeGreaterThan(0);
  });
});
