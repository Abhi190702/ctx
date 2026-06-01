import { describe, expect, it } from "vitest";
import { safeJsonParseArray } from "@ctx/core";
import { scoreCapsuleForSearch, scoreRelatedCapsule } from "../lib/search";

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

  it("scores related capsules by shared project and tags", () => {
    const score = scoreRelatedCapsule(
      {
        title: "Extension Drop Flow",
        summary: "One click drop from ChatGPT.",
        tags: "[\"extension\",\"drop\"]",
        platform: "chatgpt",
        project: { name: "ctx" }
      },
      {
        title: "Chrome Capsule Picker",
        summary: "Search and inject memory into AI chats.",
        tags: "[\"extension\",\"chrome\",\"drop\"]",
        platform: "chatgpt",
        project: { name: "ctx" }
      }
    );

    expect(score).toBeGreaterThan(30);
  });
});
