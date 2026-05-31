import { describe, expect, it } from "vitest";
import { formatCapsuleForInjection } from "../src";

describe("formatCapsuleForInjection", () => {
  it("creates AI-ready context", () => {
    const text = formatCapsuleForInjection({
      schemaVersion: "0.1.0",
      title: "KubeHeal",
      summary: "Build a Kubernetes remediation dashboard.",
      goals: ["Ship monitor page"],
      decisions: [],
      constraints: [],
      openQuestions: [],
      nextSteps: ["Run tests"],
      tags: ["devops"],
      content: { rawText: "Need local-first storage.", markdown: "" },
      metadata: { version: 1, tokenEstimate: 20, importance: 4 }
    });

    expect(text).toContain("You are being given a CTX context capsule.");
    expect(text).toContain("# Capsule: KubeHeal");
  });
});
