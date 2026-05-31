# Security Policy

CTX is local-first and stores data in SQLite by default. Even so, captures can contain sensitive information.

## Reporting

Please open a private security advisory or email the maintainers before publishing vulnerabilities.

## Current Protections

- Basic secret redaction for common API keys, GitHub tokens, OpenAI keys, Anthropic keys, private keys, and password assignments.
- GitHub capture uses `GITHUB_TOKEN` only on the server.
- Browser extension defaults to `http://localhost:3000/api`.

## Known Limits

Redaction is intentionally conservative in Day 0. Future work should add entropy scoring, provider-specific validation, and workspace-level policies.
