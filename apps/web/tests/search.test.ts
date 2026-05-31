import { describe, expect, it } from "vitest";
import { safeJsonParseArray } from "@ctx/core";

describe("search data helpers", () => {
  it("parses json tags", () => {
    expect(safeJsonParseArray("[\"github\",\"ctx\"]")).toEqual(["github", "ctx"]);
  });
});
