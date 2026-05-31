# Contributing to CTX

Thanks for helping improve CTX. This project is a local-first developer tool, so contributions should preserve privacy, clear setup, and predictable behavior.

## Development

```bash
pnpm install
pnpm dev
```

Run checks before opening a pull request:

```bash
pnpm typecheck
pnpm test
pnpm lint
```

## Guidelines

- Keep capsule format changes backward compatible when possible.
- Do not store secrets in examples, fixtures, screenshots, or docs.
- Use Zod for external input validation.
- Keep placeholders honest. Do not mark external integrations complete unless they really call the external API.
- Add tests for shared formatters, redaction, schema changes, and GitHub mapping logic.
