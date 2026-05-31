# CTX

**Portable memory for AI workflows.**

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![MCP](https://img.shields.io/badge/MCP-ready-8bf5cf)
![Local-first](https://img.shields.io/badge/local--first-SQLite-ffd166)
![License](https://img.shields.io/badge/license-MIT-white)

CTX is an open-source, local-first context platform for capturing, organizing, searching, versioning, monitoring, and injecting reusable AI context across ChatGPT, Claude, Gemini, Cursor, Windsurf, GitHub, and MCP-compatible tools.

CTX turns messy AI conversations into structured reusable project memory.

## Why CTX Exists

AI platforms do not share memory. You might start in ChatGPT, continue in Claude, debug in Cursor, research in Gemini, and lose context every time you switch tools. CTX converts conversations, GitHub issues, PRs, README files, docs, and notes into portable `.ctx.json` capsules that can be reused anywhere.

## Demo Workflow

```text
ChatGPT / Claude / Gemini / Cursor / GitHub
-> CTX Capture
-> Capsule
-> Search / Version / Monitor
-> CTX Button
-> Inject into any AI chat
-> Continue work with full context
```

## Features

- Web dashboard for capsules, projects, search, monitoring, GitHub capture, MCP setup, and settings.
- Browser extension foundation with CTX prompt button and floating capsule picker.
- MCP server with tools for search, create, update, export, GitHub capture, and project memory.
- Prisma + SQLite local-first storage.
- Zod-validated capsule format and GitHub capture inputs.
- Secret redaction for common API keys, tokens, passwords, and private keys.
- Activity logs for creation, updates, deletion, export, injection, and GitHub capture.
- Empty-by-default local workspace so your first capsules are yours.

## Architecture

```text
apps/web          Next.js dashboard, API routes, Prisma schema
apps/extension    Manifest V3 CTX capture and injection extension
apps/mcp-server   Node.js TypeScript MCP server
packages/core     Capsule schemas, formatters, redaction, GitHub mapping
packages/database Repository helpers around Prisma
packages/ui       Small shared UI primitives
docs              Product and integration documentation
examples          Portable .ctx.json examples and MCP configs
```

## Getting Started

```bash
pnpm install
pnpm dev
```

The root `dev` script pushes the SQLite schema and starts the web app with an empty workspace.

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env` or use the safe local defaults already included for development.

```env
DATABASE_URL="file:./dev.db"
CTX_APP_URL="http://localhost:3000"
CTX_API_URL="http://localhost:3000/api"
GITHUB_TOKEN=""
```

Set `GITHUB_TOKEN` to enable real GitHub issue, pull request, README, and repository capture.

## Scripts

- `pnpm dev` - prepare DB and run the web app.
- `pnpm build` - build all packages/apps with Turborepo.
- `pnpm test` - run Vitest where tests exist.
- `pnpm typecheck` - run TypeScript checks.
- `pnpm db:push` - push Prisma schema to SQLite.
- `pnpm db:seed` - confirms the workspace is empty by default.
- `pnpm web:dev` - run the web app.
- `pnpm extension:dev` - build the extension in watch mode.
- `pnpm mcp:dev` - run the MCP server.

## Capsule Format

CTX capsules are portable `.ctx.json` documents with:

- source metadata
- project metadata
- summary
- goals, decisions, constraints, open questions, next steps
- tags
- raw and markdown content
- token estimate and version metadata

See [docs/capsule-format.md](docs/capsule-format.md).

## Browser Extension

The extension injects a small `CTX` button near AI prompt boxes. Click it, search saved capsules, and insert a clean AI-ready memory prompt into the current input. It uses conservative selectors and exits silently if it cannot find a prompt.

See [docs/browser-extension.md](docs/browser-extension.md).

## MCP Server

The MCP server exposes CTX memory to Claude Desktop, Cursor, Windsurf, and compatible clients.

See [docs/mcp-server.md](docs/mcp-server.md).

## GitHub Integration

CTX can convert GitHub issues, pull requests, README files, and repository metadata into structured capsules through the official GitHub REST API.

See [docs/github-integration.md](docs/github-integration.md).

## Monitoring Dashboard

The `/monitor` page shows total capsules, projects, injections, platform distribution, recent activity, recent captures, recent injections, and capsule health signals such as missing summaries, missing tags, stale capsules, and high token capsules.

## Local-First Privacy

CTX defaults to SQLite on your machine. Captures stay local unless you explicitly connect external services. Redaction runs before capture storage for common secret patterns.

## Roadmap

- Browser extension packaging and store-ready permissions review.
- Local embeddings and semantic search.
- Capsule diff and merge.
- Workspace-level redaction policies.
- GitHub discussion capture.
- More MCP resources and prompt templates.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
