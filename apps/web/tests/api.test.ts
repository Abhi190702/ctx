import { describe, expect, it } from "vitest";
import { getGitHubTokenStatus } from "../lib/github";
import { inspectBackupPayload, buildBackupEnvelope } from "../lib/backup";
import { enrichGitHubCapsuleInput } from "../lib/github-deep-context";
import { buildProjectMemory } from "../lib/project-memory";

describe("api helpers", () => {
  it("reports github token status shape", () => {
    expect(getGitHubTokenStatus()).toHaveProperty("configured");
  });

  it("inspects backup integrity envelopes", () => {
    const capsule = { title: "CTX backup", content: { rawText: "portable" } };
    const backup = buildBackupEnvelope({
      schemaVersion: "0.1.0",
      exportedAt: "2026-06-01T00:00:00.000Z",
      projects: [],
      capsules: [capsule]
    });

    expect(inspectBackupPayload(backup)).toMatchObject({
      isBundle: true,
      capsuleCount: 1,
      checksumValid: true
    });
  });

  it("enriches github capsules with deep context", () => {
    const enriched = enrichGitHubCapsuleInput(
      {
        title: "GitHub PR #1",
        summary: "Base summary.",
        rawText: "Pull request body",
        tags: ["github", "pr"]
      },
      {
        reviews: [{ state: "CHANGES_REQUESTED", user: { login: "reviewer" }, body: "Fix the failing test." }],
        reviewComments: [{ path: "app.ts", line: 12, user: { login: "reviewer" }, body: "This branch misses null handling." }],
        checkRuns: [{ name: "test", conclusion: "failure", output: { summary: "Unit test failed." } }]
      }
    );

    expect(enriched.rawText).toContain("GitHub Deep Context");
    expect(enriched.tags).toContain("review-comments");
    expect(enriched.tags).toContain("ci-failure");
  });

  it("builds project memory briefs from capsule fields", () => {
    const memory = buildProjectMemory({
      name: "CTX",
      updatedAt: new Date("2026-06-01T00:00:00.000Z"),
      capsules: [
        {
          id: "capsule-1",
          title: "Decision Capsule",
          summary: "Keep capture easy.",
          decisions: JSON.stringify(["Use one-click capture as the primary flow."]),
          openQuestions: JSON.stringify(["How should teams share memory later?"]),
          nextSteps: JSON.stringify(["Implement archive cleanup."]),
          tags: JSON.stringify(["ctx"]),
          updatedAt: new Date("2026-06-01T00:00:00.000Z")
        }
      ]
    });

    expect(memory.agentBrief).toContain("Use one-click capture");
    expect(memory.health.openQuestionCount).toBe(1);
    expect(memory.tasks.active).toHaveLength(1);
  });
});
