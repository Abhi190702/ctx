# GitHub Integration

CTX converts GitHub issues, pull requests, README files, and repository metadata into structured capsules.

## How It Works

1. Open `/github`.
2. Enter owner, repository, capture type, and issue/PR number when needed.
3. CTX validates input with Zod.
4. The server reads `GITHUB_TOKEN`.
5. CTX calls the official GitHub REST API.
6. The response is mapped into a capsule, saved, versioned, and logged.

## Token Setup

Create a fine-grained GitHub token with read-only access to the repositories you want to capture. Public repositories can often be read unauthenticated, but CTX requires `GITHUB_TOKEN` in Day 0 so behavior is explicit and private repos are supported.

Add it to `.env`:

```env
GITHUB_TOKEN="github_pat_..."
```

## Supported Capture Types

- `issue`: `GET /repos/{owner}/{repo}/issues/{number}`
- `pull_request`: `GET /repos/{owner}/{repo}/pulls/{number}`
- `readme`: `GET /repos/{owner}/{repo}/readme`
- `repository`: `GET /repos/{owner}/{repo}`

## Current Limits

- Issue comments, PR reviews, inline review threads, commits, CI checks, and release notes are captured when API permissions allow.
- Discussions are not captured yet.
- Rate-limit handling is basic.

## Roadmap

- Discussions.
- Repository dependency context.
- GitHub App or OAuth setup instead of token-only configuration.
