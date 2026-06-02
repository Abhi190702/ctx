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

CTX also redacts provider-specific tokens and high-entropy credential assignments. Future workspace policy work should add user-defined redaction rules and organization-level enforcement.

## Encrypted Team Share Bundles

Settings includes encrypted share-bundle export/import for small teams that want to exchange CTX memory without a hosted server.

- Bundles use AES-256-GCM.
- Keys are derived from the user's passphrase with PBKDF2-SHA256.
- The encrypted payload includes CTX backup data and a team policy envelope.
- CTX verifies the encrypted payload checksum before import.

Keep the passphrase out of the exported file and share it through a separate channel.
