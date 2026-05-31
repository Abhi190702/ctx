# CTX

Portable memory for AI workflows.

CTX is a local-first app for turning chats, GitHub context, notes, and project decisions into reusable AI memory capsules. A capsule can be searched, reviewed, exported, injected into another AI tool, or exposed to MCP-compatible agents.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![SQLite](https://img.shields.io/badge/storage-SQLite-ffd166)
![MCP](https://img.shields.io/badge/MCP-ready-8bf5cf)
![License](https://img.shields.io/badge/license-MIT-white)

## What Works Today

- Next.js web dashboard for capsules, projects, search, GitHub capture, monitoring, MCP setup, import/export, editing, deletion, and injection previews.
- Fast capsule creator: paste text or import `.txt`, `.md`, `.json`, or `.ctx.json`, preview the generated capsule, review key fields, then save.
- Local deterministic extraction for title, summary, tags, project hints, goals, decisions, constraints, open questions, next steps, importance, and markdown notes.
- Browser extension for ChatGPT, Claude, Gemini, Perplexity, and GitHub with Generate, Drop, Open CTX, health checks, and copy fallback.
- GitHub capture for repositories, issues, pull requests, README context, commits, and review-oriented handoff capsules when `GITHUB_TOKEN` is configured.
- MCP server tools for agents that need to create, search, update, export, and retrieve project memory.
- Local SQLite storage, secret redaction, version snapshots, latest-version diff, activity history, and backup/restore.

## Requirements

- Node.js 20 or newer
- pnpm 9.15 or newer
- Git
- Chrome or Chromium-based browser for the extension

Enable pnpm with Corepack if needed:

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

## Quick Start

```bash
git clone https://github.com/Abhi190702/ctx.git
cd ctx
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows PowerShell, use this instead of `cp`:

```powershell
Copy-Item .env.example .env
```

## Production Run

Build the app and run the optimized Next.js server:

```bash
pnpm install
pnpm db:push
pnpm build
pnpm start
```

The production server uses the root `start` script, which runs the web app with `next start`.

For a custom port:

```bash
pnpm --dir apps/web start -p 3000
```

## Environment

Create `.env` from `.env.example`.

```env
DATABASE_URL="file:./dev.db"
CTX_APP_URL="http://localhost:3000"
CTX_API_URL="http://localhost:3000/api"
GITHUB_TOKEN=""
```

`DATABASE_URL` points to the local SQLite database used by Prisma.

`CTX_APP_URL` and `CTX_API_URL` are shown in settings and used by MCP/examples.

`GITHUB_TOKEN` is optional. Add a fine-grained read-only token if you want CTX to capture private GitHub repositories, issues, and pull requests.

## Main Workflows

Create a capsule from pasted context:

1. Go to `/capsules/new`.
2. Paste a chat, error log, PR review, notes, or research text.
3. Click `Preview Capsule`.
4. Review title, project, tags, summary, next steps, and quality hints.
5. Click `Save Reviewed Capsule`.

Drop memory into an AI chat:

1. Start CTX on `localhost:3000`.
2. Load the extension from `apps/extension/dist`.
3. Open ChatGPT, Claude, Gemini, Perplexity, or GitHub.
4. Click the floating `CTX` button.
5. Use `Drop` and pick a capsule.

Capture GitHub context:

1. Add `GITHUB_TOKEN` to `.env`.
2. Restart the web app.
3. Go to `/github`.
4. Capture a repository, issue, pull request, README, or review context.

## Browser Extension

Build the extension:

```bash
pnpm --filter @ctx/extension build
```

Load it in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click `Load unpacked`.
4. Select `apps/extension/dist`.
5. Keep the CTX web app running.

The default extension API URL is:

```text
http://localhost:3000/api
```

You can change it from the extension popup or options page. The extension includes local host permissions for `localhost` and `127.0.0.1`.

## MCP Server

Run the MCP server during development:

```bash
pnpm mcp:dev
```

If CTX is not running on the default API URL:

```bash
CTX_API_URL=http://localhost:3000/api pnpm mcp:dev
```

Example client configs are in `examples/mcp`.

## Backup And Restore

Use the dashboard backup controls on the Capsules page to export all capsules. The export is a portable JSON bundle that can be restored through the same UI.

Keep backups somewhere outside the repo if the data matters.

## Project Structure

```text
apps/web          Next.js app, API routes, Prisma schema, dashboard UI
apps/extension    Manifest V3 extension for capture and injection
apps/mcp-server   MCP server for agent access
packages/core     Capsule schema, formatting, redaction, GitHub mapping
packages/database Repository helpers
packages/ui       Shared UI primitives
docs              Integration and architecture notes
examples          Sample capsules and MCP configs
```

## Scripts

```bash
pnpm dev          # push schema and run the web app in development
pnpm start        # run the built web app
pnpm build        # build all packages/apps
pnpm lint         # lint all packages/apps
pnpm test         # run tests
pnpm typecheck    # run TypeScript checks
pnpm db:push      # apply SQLite schema and generate Prisma client
pnpm db:reset     # reset local SQLite database
pnpm web:dev      # run only the web app in development
pnpm mcp:dev      # run the MCP server
pnpm extension:dev # watch-build the extension
```

## Verification Before Release

Run these before publishing changes:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

For extension-only changes:

```bash
pnpm --filter @ctx/extension lint
pnpm --filter @ctx/extension build
```

## Privacy And Security

- CTX stores data locally in SQLite by default.
- Captured text is redacted for common API keys, tokens, passwords, and private keys before storage.
- GitHub capture uses the official GitHub REST API and only runs when `GITHUB_TOKEN` is configured.
- The extension talks to your configured CTX API URL. By default, that is local only.
- Do not commit `.env`, database files, or exported capsule backups that contain private data.

## Troubleshooting

`Failed to load capsules` in the extension:

- Make sure the web app is running.
- Confirm the extension API URL is `http://localhost:3000/api`.
- Open [http://localhost:3000/api/health](http://localhost:3000/api/health). It should return a healthy JSON response.

GitHub capture says token is missing:

- Add `GITHUB_TOKEN` to `.env`.
- Restart the web app.
- Use a token with read access to the repository you are capturing.

Database errors after changing schema:

```bash
pnpm db:push
```

For a full local reset:

```bash
pnpm db:reset
```

Extension changes are not visible:

- Rebuild the extension.
- Go to `chrome://extensions`.
- Click reload on CTX.
- Refresh the target AI/GitHub page.

## Current Limitations

- AI extraction is local and heuristic by default. Hosted model extraction is not wired into this build.
- Search is hybrid keyword/alias ranking, not a full embedding index yet.
- The Chrome extension is load-unpacked for now, not signed or Chrome Web Store packaged.
- Sync is local export/restore, not cloud sync.

## Documentation

- [Capsule format](docs/capsule-format.md)
- [Browser extension](docs/browser-extension.md)
- [GitHub integration](docs/github-integration.md)
- [MCP server](docs/mcp-server.md)
- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Roadmap](ROADMAP.md)

## License

MIT. See [LICENSE](LICENSE).
