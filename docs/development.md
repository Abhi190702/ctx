# Development

## Setup

```bash
pnpm install
pnpm dev
```

The default dev command pushes the Prisma schema and starts the web app with an empty workspace.

## Checks

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## Database

```bash
pnpm db:push
pnpm db:seed
pnpm db:reset
```

`pnpm db:seed` does not create demo capsules. CTX starts empty so local memory only contains capsules you create, import, or capture.

## Extension

```bash
pnpm extension:dev
```

Load `apps/extension/dist` in Chromium as an unpacked extension.
