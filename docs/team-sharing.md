# Team Sharing

CTX does not yet have hosted teams, accounts, billing, or centralized permissions. The current team-ready path is local-first encrypted share bundles.

## What Works

- Export all local CTX memory as an encrypted JSON bundle from Settings.
- Import an encrypted bundle into another CTX workspace with the same passphrase.
- Inspect bundle metadata before import.
- Preserve local-first control: the bundle is generated locally and can be moved through any channel the team already trusts.

## How To Use

1. Open Settings.
2. Enter a team or workspace name.
3. Enter a passphrase with at least 8 characters.
4. Click `Export Share Bundle`.
5. Send the JSON file to the teammate.
6. Share the passphrase through a separate channel.
7. The teammate opens Settings, enters the passphrase, and imports the bundle.

## Current Limits

- There are no hosted user accounts yet.
- There is no server-side role enforcement yet.
- Imported capsules should be reviewed before being re-shared.
- Passphrase loss means the encrypted bundle cannot be recovered.

## Future SaaS Work

- Team workspaces with account auth.
- Role-based permissions for read, write, export, and admin.
- Organization redaction policy.
- Shared review queue before memory enters a team workspace.
- Usage analytics for stale context and memory reuse.
