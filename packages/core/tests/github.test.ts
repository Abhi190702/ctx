import { describe, expect, it } from "vitest";
import { formatGitHubIssueAsCapsule, formatGitHubRepositoryAsCapsule } from "../src";

describe("github formatters", () => {
  it("formats issues into capsules", () => {
    const capsule = formatGitHubIssueAsCapsule("acme", "demo", {
      number: 7,
      title: "Fix auth flow",
      body: "The callback drops state.",
      state: "open",
      html_url: "https://github.com/acme/demo/issues/7",
      user: { login: "octo" },
      labels: [{ name: "bug" }]
    });

    expect(capsule.title).toContain("#7");
    expect(capsule.tags).toContain("issue");
    expect(capsule.rawText).toContain("The callback drops state.");
  });

  it("formats repository metadata", () => {
    const capsule = formatGitHubRepositoryAsCapsule("acme", "demo", {
      name: "demo",
      full_name: "acme/demo",
      description: "Demo repo",
      html_url: "https://github.com/acme/demo",
      language: "TypeScript",
      stargazers_count: 42,
      forks_count: 5,
      topics: ["ai"],
      license: { spdx_id: "MIT" },
      default_branch: "main"
    });

    expect(capsule.summary).toContain("Demo repo");
    expect(capsule.tags).toContain("typescript");
  });
});
