# Local-First

CTX defaults to a local SQLite database at `apps/web/prisma/dev.db`.

## Why Local First

- Captured AI conversations often include sensitive project context.
- Users should be able to run CTX without a cloud account.
- Capsules should remain portable as `.ctx.json` files.

## Sync Future

Future sync should be opt-in, encrypted, and compatible with the portable capsule format.
