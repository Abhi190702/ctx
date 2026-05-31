# Privacy

CTX is designed around local-first storage and explicit integrations.

## Storage

Capsules, projects, versions, activities, and GitHub capture metadata are stored in SQLite by default.

## Redaction

CTX redacts common secret patterns before storing captured text:

- OpenAI-style keys
- Anthropic-style keys
- GitHub tokens
- generic API key/token assignments
- password assignments
- private keys

Day 1 work should add entropy scoring and workspace-level policies.
