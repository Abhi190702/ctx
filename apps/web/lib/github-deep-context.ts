import { normalizeTags, type CreateCapsuleInput } from "@ctx/core";

type GitHubDeepContext = {
  issueComments?: any[];
  reviews?: any[];
  reviewComments?: any[];
  commits?: any[];
  checkRuns?: any[];
  releases?: any[];
};

export function enrichGitHubCapsuleInput(input: CreateCapsuleInput, context: GitHubDeepContext): CreateCapsuleInput {
  const markdown = buildGitHubDeepContextMarkdown(context);
  if (!markdown) return input;

  const tags = inferDeepContextTags(input.tags, context);
  const nextSteps = [
    ...(Array.isArray(input.nextSteps) ? input.nextSteps : []),
    ...failedCheckRuns(context).map((run) => `Investigate failing check: ${run.name ?? run.check_suite?.app?.name ?? "unknown check"}`)
  ];

  return {
    ...input,
    summary: appendSummary(input.summary, context),
    rawText: [input.rawText, markdown].filter(Boolean).join("\n\n---\n\n"),
    markdown: [input.markdown, markdown].filter(Boolean).join("\n\n"),
    tags,
    nextSteps: nextSteps.length ? nextSteps : input.nextSteps
  };
}

export function buildGitHubDeepContextMarkdown(context: GitHubDeepContext) {
  const sections = [
    commentsSection("Issue Comments", context.issueComments),
    reviewsSection(context.reviews),
    reviewCommentsSection(context.reviewComments),
    commitsSection(context.commits),
    checkRunsSection(context.checkRuns),
    releasesSection(context.releases)
  ].filter(Boolean);

  if (!sections.length) return "";
  return ["# GitHub Deep Context", ...sections].join("\n\n");
}

function commentsSection(title: string, comments: any[] | undefined) {
  const rows = (comments ?? []).slice(0, 20).map((comment) => {
    const author = comment.user?.login ?? "unknown";
    const body = compact(comment.body ?? "No comment body.");
    return `- ${author}: ${body}`;
  });
  return rows.length ? [`## ${title}`, ...rows].join("\n") : "";
}

function reviewsSection(reviews: any[] | undefined) {
  const rows = (reviews ?? []).slice(0, 20).map((review) => {
    const state = review.state ?? "unknown";
    const author = review.user?.login ?? "unknown";
    const body = compact(review.body ?? "");
    return `- ${state} by ${author}${body ? `: ${body}` : ""}`;
  });
  return rows.length ? ["## PR Reviews", ...rows].join("\n") : "";
}

function reviewCommentsSection(comments: any[] | undefined) {
  const rows = (comments ?? []).slice(0, 30).map((comment) => {
    const author = comment.user?.login ?? "unknown";
    const file = comment.path ? `${comment.path}:${comment.line ?? comment.original_line ?? "?"}` : "review thread";
    const body = compact(comment.body ?? "No review comment body.");
    return `- ${file} · ${author}: ${body}`;
  });
  return rows.length ? ["## Inline Review Threads", ...rows].join("\n") : "";
}

function commitsSection(commits: any[] | undefined) {
  const rows = (commits ?? []).slice(0, 20).map((commit) => {
    const sha = String(commit.sha ?? "").slice(0, 7);
    const message = compact(commit.commit?.message ?? "No commit message.");
    return `- ${sha}: ${message}`;
  });
  return rows.length ? ["## Commits", ...rows].join("\n") : "";
}

function checkRunsSection(checkRuns: any[] | undefined) {
  const rows = (checkRuns ?? []).slice(0, 30).map((run) => {
    const conclusion = run.conclusion ?? run.status ?? "unknown";
    const name = run.name ?? run.check_suite?.app?.name ?? "check";
    const detail = compact(run.output?.summary ?? run.output?.title ?? "");
    return `- ${name}: ${conclusion}${detail ? ` · ${detail}` : ""}`;
  });
  return rows.length ? ["## CI Checks", ...rows].join("\n") : "";
}

function releasesSection(releases: any[] | undefined) {
  const rows = (releases ?? []).slice(0, 10).map((release) => {
    const tag = release.tag_name ?? release.name ?? "release";
    const body = compact(release.body ?? "No release notes.");
    return `- ${tag}: ${body}`;
  });
  return rows.length ? ["## Recent Releases", ...rows].join("\n") : "";
}

function appendSummary(summary: string | null | undefined, context: GitHubDeepContext) {
  const additions = [
    countLabel(context.issueComments, "issue comments"),
    countLabel(context.reviews, "reviews"),
    countLabel(context.reviewComments, "inline review comments"),
    countLabel(context.commits, "commits"),
    countLabel(context.checkRuns, "CI checks"),
    countLabel(context.releases, "releases")
  ].filter(Boolean);

  return [summary, additions.length ? `Deep capture includes ${additions.join(", ")}.` : ""].filter(Boolean).join(" ");
}

function inferDeepContextTags(tags: CreateCapsuleInput["tags"], context: GitHubDeepContext) {
  const existing = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(/[,#\n]/g) : [];
  const inferred = [
    (context.issueComments?.length ?? 0) > 0 ? "discussion" : "",
    (context.reviews?.length ?? 0) > 0 || (context.reviewComments?.length ?? 0) > 0 ? "review-comments" : "",
    (context.commits?.length ?? 0) > 0 ? "commits" : "",
    (context.checkRuns?.length ?? 0) > 0 ? "ci" : "",
    failedCheckRuns(context).length > 0 ? "ci-failure" : "",
    (context.releases?.length ?? 0) > 0 ? "release-notes" : ""
  ];
  return normalizeTags([...existing, ...inferred]);
}

function failedCheckRuns(context: GitHubDeepContext) {
  return (context.checkRuns ?? []).filter((run) => ["failure", "cancelled", "timed_out", "action_required"].includes(String(run.conclusion ?? "")));
}

function countLabel(value: any[] | undefined, label: string) {
  return value?.length ? `${value.length} ${label}` : "";
}

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 420);
}
