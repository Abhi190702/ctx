# CTX

**Portable memory for AI workflows.**

CTX is an open-source, local-first context layer that helps you capture, organize, and reuse important project context across ChatGPT, Claude, Gemini, Cursor, Windsurf, and MCP-compatible AI tools.

When your AI chat becomes too long, your tokens run out, or you want to switch from one AI platform to another, CTX lets you package the important context into a reusable capsule and inject it wherever you need it.

---

## Why CTX?

AI tools are powerful, but they do not share memory.

You may start a project in ChatGPT, continue it in Claude, debug it in Cursor, and research it in Gemini. Every time you switch tools, you lose context.

CTX solves this by creating portable context capsules.

A CTX capsule can contain:

- Project summaries
- Goals
- Decisions
- Constraints
- Open questions
- Next steps
- Raw conversation context
- Source links
- Tags
- Attachments in future versions

---

## Core Idea

CTX turns messy AI conversations into structured, reusable project memory.

Instead of copy-pasting long conversations again and again, you can save a capsule once and reuse it anywhere.

Example:

```txt
User works in ChatGPT
↓
CTX captures project context
↓
CTX creates a structured capsule
↓
User opens Claude, Gemini, Cursor, or another AI tool
↓
User clicks CTX button
↓
The capsule is injected into the new AI chat
```

## Features

### Current MVP Goals
- Create and edit context capsules
- Organize capsules by project and tags
- Search saved capsules
- Export and import capsules as JSON
- Browser extension for capturing selected text
- Browser extension button for injecting capsules into AI chats
- MCP server for AI agents and tools
- Local-first SQLite database

### Planned Features
- ChatGPT, Claude, Gemini, and Perplexity conversation capture
- GitHub issue and PR capture
- Gmail and documentation capture
- Capsule version history
- Capsule merge
- Capsule diff
- Team workspaces
- Local encryption
- Secret redaction
- Semantic search
- Desktop app
- VS Code extension

## What is a Capsule?

A capsule is a structured context package.

```json
{
  "schemaVersion": "0.1.0",
  "title": "Kubernetes Auto-Healing Dashboard",
  "summary": "The user is building an open-source dashboard for Kubernetes monitoring.",
  "goals": [
    "Show cluster health",
    "Detect pod failures",
    "Suggest remediation"
  ],
  "decisions": [
    "Use React for frontend",
    "Use Prometheus for metrics"
  ],
  "constraints": [
    "Local-first",
    "Open-source",
    "Beginner-friendly setup"
  ],
  "nextSteps": [
    "Create dashboard UI",
    "Add mock Prometheus data",
    "Build MCP server"
  ],
  "tags": ["kubernetes", "devops", "aiops"]
}
```

## Monorepo Structure

```text
ctx/
├── apps/
│   ├── web/          # Next.js dashboard
│   ├── extension/    # Browser extension
│   └── mcp-server/   # MCP server
├── packages/
│   ├── core/         # Capsule schema, formatting, validation
│   ├── database/     # Database access layer
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configs
├── docs/             # Documentation
├── examples/         # Example capsules and configs
├── scripts/          # Setup and utility scripts
└── docker/           # Docker setup
```

## Tech Stack
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- SQLite
- Node.js
- MCP SDK
- Chrome Extension APIs
- pnpm
- Turborepo

## Getting Started

### Prerequisites

Install:

- Node.js 20+
- pnpm
- Git

### Clone the repository
```bash
git clone https://github.com/your-username/ctx.git
cd ctx
```

### Install dependencies
```bash
pnpm install
```

### Set up environment variables
```bash
cp .env.example .env
```

### Set up database
```bash
pnpm db:push
pnpm db:seed
```

### Run development server
```bash
pnpm dev
```

The web app should run at:
http://localhost:3000

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
CTX_APP_URL="http://localhost:3000"
CTX_API_URL="http://localhost:3000/api"
```

## Scripts
- `pnpm dev`             # Run all apps in development
- `pnpm build`           # Build all apps
- `pnpm lint`            # Run linting
- `pnpm test`            # Run tests
- `pnpm format`          # Format code
- `pnpm db:push`         # Push Prisma schema
- `pnpm db:seed`         # Seed local database
- `pnpm db:reset`        # Reset local database

## Browser Extension

The CTX extension lets users:

- Capture selected text
- Capture the current page
- Save content as a capsule
- Inject saved capsules into AI chat boxes

Supported platforms planned:

- ChatGPT
- Claude
- Gemini
- Perplexity
- Cursor web flows
- Generic websites

## MCP Server

CTX includes an MCP server so AI clients can access your capsules.

Planned MCP tools:

- `ctx_search_capsules`
- `ctx_get_capsule`
- `ctx_create_capsule`
- `ctx_update_capsule`
- `ctx_list_recent_capsules`
- `ctx_export_capsule`

Example use:

*Search my CTX capsules for the Kubernetes dashboard project and load the latest context.*

## Privacy

CTX is designed to be local-first.

Your context can stay on your machine.

Privacy-focused goals:

- Local SQLite database by default
- No forced cloud account
- No hidden tracking
- Exportable data
- Secret redaction planned
- Local encryption planned

## Roadmap

### Phase 0
- [ ] Project setup
- [ ] Monorepo structure
- [ ] README
- [ ] License
- [ ] Basic Next.js app
- [ ] Prisma SQLite setup
- [ ] Capsule schema

### Phase 1
- [ ] Capsule CRUD
- [ ] Dashboard UI
- [ ] Search
- [ ] Import/export

### Phase 2
- [ ] Browser extension
- [ ] Capture selected text
- [ ] Save to CTX
- [ ] Inject capsule into AI chat input

### Phase 3
- [ ] MCP server
- [ ] Claude Desktop support
- [ ] Cursor support
- [ ] Capsule retrieval tools

### Phase 4
- [ ] GitHub integration
- [ ] Capsule versioning
- [ ] Secret redaction
- [ ] Semantic search

### Phase 5
- [ ] Team self-hosting
- [ ] Encryption
- [ ] Desktop app
- [ ] VS Code extension

## Contributing

Contributions are welcome.

Good first areas:

- UI improvements
- Capsule schema improvements
- Browser extension support for more platforms
- MCP tools
- Documentation
- Tests
- Import/export formats

Read `CONTRIBUTING.md` before opening a pull request.

## License

MIT License.

## Project Status

CTX is in early development.

The current goal is to build a strong MVP for local-first AI context portability.
