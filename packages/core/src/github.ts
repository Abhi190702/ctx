import { z } from "zod";
import { estimateTokens, normalizeTags } from "./capsule";
import type { CreateCapsuleInput } from "./schema";

export const GitHubCaptureTypeSchema = z.enum(["issue", "pull_request", "readme", "repository"]);

export const GitHubCaptureSchema = z
  .object({
    owner: z.string().min(1),
    repo: z.string().min(1),
    type: GitHubCaptureTypeSchema,
    number: z.coerce.number().int().positive().optional()
  })
  .refine((value) => (value.type === "issue" || value.type === "pull_request" ? Boolean(value.number) : true), {
    message: "number is required for issue and pull_request captures",
    path: ["number"]
  });

type GitHubLabel = string | { name?: string | null };

function labelNames(labels: GitHubLabel[] | undefined): string[] {
  return (labels ?? [])
    .map((label) => (typeof label === "string" ? label : label.name ?? ""))
    .filter(Boolean);
}

function baseTags(owner: string, repo: string, extra: string[] = []): string[] {
  return normalizeTags(["github", owner, repo, ...extra]);
}

export function formatGitHubIssueAsCapsule(owner: string, repo: string, issue: any): CreateCapsuleInput {
  const labels = labelNames(issue.labels);
  const body = issue.body || "No issue body was provided.";
  const rawText = [
    `Issue: #${issue.number} ${issue.title}`,
    `Repository: ${owner}/${repo}`,
    `Author: ${issue.user?.login ?? "unknown"}`,
    `State: ${issue.state}`,
    `URL: ${issue.html_url}`,
    labels.length ? `Labels: ${labels.join(", ")}` : "Labels: none",
    issue.milestone?.title ? `Milestone: ${issue.milestone.title}` : "",
    "",
    body
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title: `GitHub Issue #${issue.number}: ${issue.title}`,
    description: `Captured from ${owner}/${repo}`,
    summary: `${issue.title}. ${body.slice(0, 220)}`,
    platform: "github",
    sourceUrl: issue.html_url,
    sourceType: "github_issue",
    goals: ["Understand issue request", "Track required implementation", "Preserve discussion context"],
    decisions: [issue.state ? `Issue state: ${issue.state}` : "", ...labels.map((label) => `Label: ${label}`)].filter(Boolean),
    constraints: [`Repository: ${owner}/${repo}`, `Issue state: ${issue.state}`, `Labels: ${labels.join(", ") || "none"}`],
    nextSteps: ["Review issue", "Identify files to change", "Implement fix or feature", "Open PR"],
    tags: baseTags(owner, repo, ["issue", ...labels]),
    rawText,
    markdown: body,
    importance: Math.min(10, Math.ceil(estimateTokens(body) / 250))
  };
}

export function formatGitHubPullRequestAsCapsule(owner: string, repo: string, pr: any): CreateCapsuleInput {
  const body = pr.body || "No pull request body was provided.";
  const rawText = [
    `Pull Request: #${pr.number} ${pr.title}`,
    `Repository: ${owner}/${repo}`,
    `Author: ${pr.user?.login ?? "unknown"}`,
    `State: ${pr.state}`,
    `URL: ${pr.html_url}`,
    `Base: ${pr.base?.ref ?? "unknown"}`,
    `Head: ${pr.head?.ref ?? "unknown"}`,
    `Mergeable: ${String(pr.mergeable ?? "unknown")}`,
    "",
    body
  ].join("\n");

  return {
    title: `GitHub PR #${pr.number}: ${pr.title}`,
    description: `Captured from ${owner}/${repo}`,
    summary: `${pr.title}. Base ${pr.base?.ref ?? "unknown"} <- head ${pr.head?.ref ?? "unknown"}. ${body.slice(0, 180)}`,
    platform: "github",
    sourceUrl: pr.html_url,
    sourceType: "github_pull_request",
    goals: ["Understand PR changes", "Review implementation", "Track merge context"],
    decisions: [
      `Base branch: ${pr.base?.ref ?? "unknown"}`,
      `Head branch: ${pr.head?.ref ?? "unknown"}`,
      `Mergeable: ${String(pr.mergeable ?? "unknown")}`,
      `PR state: ${pr.state}`
    ],
    constraints: [`Repository: ${owner}/${repo}`, `PR state: ${pr.state}`, `Review/merge status: ${String(pr.mergeable_state ?? "unknown")}`],
    nextSteps: ["Review files", "Run tests", "Address comments", "Merge or request changes"],
    tags: baseTags(owner, repo, ["pull-request", "pr"]),
    rawText,
    markdown: body
  };
}

export function formatGitHubReadmeAsCapsule(owner: string, repo: string, markdown: string, url?: string): CreateCapsuleInput {
  return {
    title: `GitHub README: ${owner}/${repo}`,
    description: "Repository README captured from GitHub.",
    summary: "Repository README captured from GitHub.",
    platform: "github",
    sourceUrl: url,
    sourceType: "github_readme",
    goals: ["Understand repository purpose", "Capture setup instructions", "Preserve project documentation"],
    tags: baseTags(owner, repo, ["readme"]),
    rawText: markdown,
    markdown
  };
}

export function formatGitHubRepositoryAsCapsule(owner: string, repo: string, repository: any): CreateCapsuleInput {
  const topics: string[] = repository.topics ?? [];
  const rawText = [
    `Name: ${repository.name}`,
    `Full name: ${repository.full_name}`,
    `Description: ${repository.description ?? "No description"}`,
    `URL: ${repository.html_url}`,
    `Language: ${repository.language ?? "unknown"}`,
    `Stars: ${repository.stargazers_count ?? 0}`,
    `Forks: ${repository.forks_count ?? 0}`,
    `Open issues: ${repository.open_issues_count ?? 0}`,
    `Topics: ${topics.join(", ") || "none"}`,
    `License: ${repository.license?.spdx_id ?? "unknown"}`,
    `Homepage: ${repository.homepage || "none"}`,
    `Default branch: ${repository.default_branch ?? "main"}`,
    `Created: ${repository.created_at}`,
    `Updated: ${repository.updated_at}`
  ].join("\n");

  return {
    title: `GitHub Repository: ${owner}/${repo}`,
    description: repository.description,
    summary: `${repository.description ?? "Repository metadata captured from GitHub."} Language: ${repository.language ?? "unknown"}. Stars: ${repository.stargazers_count ?? 0}. Forks: ${repository.forks_count ?? 0}.`,
    platform: "github",
    sourceUrl: repository.html_url,
    sourceType: "github_repository",
    goals: ["Understand repository purpose", "Capture project metadata", "Preserve useful repo overview"],
    constraints: [`Default branch: ${repository.default_branch ?? "main"}`, `License: ${repository.license?.spdx_id ?? "unknown"}`],
    tags: baseTags(owner, repo, ["repository", repository.language ?? "", ...topics]),
    rawText,
    markdown: rawText
  };
}

export type GitHubCaptureInput = z.infer<typeof GitHubCaptureSchema>;
