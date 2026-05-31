# CTX Architecture

CTX is a pnpm/Turborepo monorepo with three product surfaces and shared packages.

## Surfaces

- `apps/web`: Next.js App Router dashboard and API. It owns Prisma, SQLite, activity logging, GitHub capture, import/export, search, and monitoring.
- `apps/extension`: Manifest V3 browser extension. It captures selected text or pages and injects a CTX button near AI prompt boxes.
- `apps/mcp-server`: Node.js TypeScript MCP server. It exposes CTX tools to Claude Desktop, Cursor, Windsurf, and compatible MCP clients.

## Shared Packages

- `packages/core`: Zod schemas, `.ctx.json` format, AI injection formatting, redaction, version helpers, platform detection, and GitHub mapping utilities.
- `packages/database`: Thin Prisma repository helpers for future consumers outside the web app.
- `packages/ui`: Small shared React primitives.

## Data Flow

1. A user creates or captures context.
2. The web API validates input with Zod.
3. Redaction runs before storage.
4. Prisma writes capsule, version, and activity rows to SQLite.
5. The dashboard, extension, and MCP server read capsules through the API.
