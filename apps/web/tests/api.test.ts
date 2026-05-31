import { describe, expect, it } from "vitest";
import { getGitHubTokenStatus } from "../lib/github";

describe("api helpers", () => {
  it("reports github token status shape", () => {
    expect(getGitHubTokenStatus()).toHaveProperty("configured");
  });
});
