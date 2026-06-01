import {
  GitHubCaptureSchema,
  formatGitHubIssueAsCapsule,
  formatGitHubPullRequestAsCapsule,
  formatGitHubReadmeAsCapsule,
  formatGitHubRepositoryAsCapsule,
  type GitHubCaptureInput
} from "@ctx/core";
import { createCapsule } from "./capsules";
import { prisma } from "./db";
import { logActivity } from "./activity";
import { enrichGitHubCapsuleInput } from "./github-deep-context";

const apiVersion = "2022-11-28";

function token() {
  return process.env.GITHUB_TOKEN?.trim();
}

function headers() {
  const githubToken = token();
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN is not configured. Add it to .env to enable GitHub capture.");
  }

  return {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": apiVersion
  };
}

async function githubFetch(path: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: headers(),
    cache: "no-store"
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API request failed (${response.status}). ${detail.slice(0, 240)}`);
  }

  return response.json();
}

async function optionalGitHubFetch(path: string) {
  try {
    return await githubFetch(path);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "GitHub request failed." };
  }
}

export function getGitHubTokenStatus() {
  return {
    configured: Boolean(token()),
    apiVersion
  };
}

export function fetchGitHubIssue(owner: string, repo: string, number: number) {
  return githubFetch(`/repos/${owner}/${repo}/issues/${number}`);
}

export function fetchGitHubPullRequest(owner: string, repo: string, number: number) {
  return githubFetch(`/repos/${owner}/${repo}/pulls/${number}`);
}

export async function fetchGitHubReadme(owner: string, repo: string) {
  const data = await githubFetch(`/repos/${owner}/${repo}/readme`);
  const normalized = String(data.content ?? "").replace(/\n/g, "");
  return {
    ...data,
    decoded: Buffer.from(normalized, "base64").toString("utf8")
  };
}

export function fetchGitHubRepository(owner: string, repo: string) {
  return githubFetch(`/repos/${owner}/${repo}`);
}

export async function createCapsuleFromGitHubCapture(input: unknown) {
  const capture = GitHubCaptureSchema.parse(input) as GitHubCaptureInput;
  const { owner, repo, type, number } = capture;
  let rawData: any;
  let capsuleInput;

  if (type === "issue") {
    rawData = await fetchGitHubIssue(owner, repo, number!);
    capsuleInput = formatGitHubIssueAsCapsule(owner, repo, rawData);
    const deepContext = await fetchIssueDeepContext(owner, repo, number!);
    capsuleInput = enrichGitHubCapsuleInput(capsuleInput, deepContext);
    rawData = { ...rawData, deepContext };
  } else if (type === "pull_request") {
    rawData = await fetchGitHubPullRequest(owner, repo, number!);
    capsuleInput = formatGitHubPullRequestAsCapsule(owner, repo, rawData);
    const deepContext = await fetchPullRequestDeepContext(owner, repo, number!, rawData.head?.sha);
    capsuleInput = enrichGitHubCapsuleInput(capsuleInput, deepContext);
    rawData = { ...rawData, deepContext };
  } else if (type === "readme") {
    rawData = await fetchGitHubReadme(owner, repo);
    capsuleInput = formatGitHubReadmeAsCapsule(owner, repo, rawData.decoded, rawData.html_url);
  } else {
    rawData = await fetchGitHubRepository(owner, repo);
    capsuleInput = formatGitHubRepositoryAsCapsule(owner, repo, rawData);
    const deepContext = await fetchRepositoryDeepContext(owner, repo);
    capsuleInput = enrichGitHubCapsuleInput(capsuleInput, deepContext);
    rawData = { ...rawData, deepContext };
  }

  const capsule = await createCapsule(
    {
      ...capsuleInput,
      projectName: `${owner}/${repo}`,
      repository: `https://github.com/${owner}/${repo}`
    },
    `Created from GitHub ${type}`,
  );

  if (!capsule) throw new Error("Capsule creation failed.");

  const githubCapture = await prisma.gitHubCapture.create({
    data: {
      type,
      owner,
      repo,
      number: number ?? null,
      title: capsule.title,
      url: capsule.sourceUrl ?? `https://github.com/${owner}/${repo}`,
      rawData: JSON.stringify(rawData),
      capsuleId: capsule.id
    }
  });

  await logActivity({
    type: "github_capture_created",
    capsuleId: capsule.id,
    projectId: capsule.projectId,
    platform: "github",
    message: `Created GitHub ${type} capsule for ${owner}/${repo}`,
    metadata: { githubCaptureId: githubCapture.id }
  });

  return { capsule, githubCapture };
}

async function fetchIssueDeepContext(owner: string, repo: string, number: number) {
  const issueComments = await optionalGitHubFetch(`/repos/${owner}/${repo}/issues/${number}/comments?per_page=100`);
  return {
    issueComments: Array.isArray(issueComments) ? issueComments : []
  };
}

async function fetchPullRequestDeepContext(owner: string, repo: string, number: number, headSha?: string) {
  const [issueComments, reviews, reviewComments, commits, checkRuns] = await Promise.all([
    optionalGitHubFetch(`/repos/${owner}/${repo}/issues/${number}/comments?per_page=100`),
    optionalGitHubFetch(`/repos/${owner}/${repo}/pulls/${number}/reviews?per_page=100`),
    optionalGitHubFetch(`/repos/${owner}/${repo}/pulls/${number}/comments?per_page=100`),
    optionalGitHubFetch(`/repos/${owner}/${repo}/pulls/${number}/commits?per_page=100`),
    headSha ? optionalGitHubFetch(`/repos/${owner}/${repo}/commits/${headSha}/check-runs?per_page=100`) : Promise.resolve({ check_runs: [] })
  ]);

  return {
    issueComments: Array.isArray(issueComments) ? issueComments : [],
    reviews: Array.isArray(reviews) ? reviews : [],
    reviewComments: Array.isArray(reviewComments) ? reviewComments : [],
    commits: Array.isArray(commits) ? commits : [],
    checkRuns: Array.isArray((checkRuns as any).check_runs) ? (checkRuns as any).check_runs : []
  };
}

async function fetchRepositoryDeepContext(owner: string, repo: string) {
  const releases = await optionalGitHubFetch(`/repos/${owner}/${repo}/releases?per_page=10`);
  return {
    releases: Array.isArray(releases) ? releases : []
  };
}
