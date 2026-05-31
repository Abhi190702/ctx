# CTX Roadmap

CTX should become the easiest way to capture, carry, search, and reuse AI working memory across tools. The product direction is comfort first: users should not manually fill long forms unless they choose the advanced path.

## Current Progress Snapshot

Implemented now:

- Local-first web app with dashboard, capsule list, project pages, search, monitor, settings, import, export, delete, edit, and injection preview.
- Fast capsule creator with paste, clipboard import, file import, generated preview, quick save, and optional advanced manual editor.
- Deterministic capsule intelligence that generates title, summary, tags, project hints, goals, decisions, constraints, open questions, next steps, source metadata, importance, and markdown notes without requiring an API key.
- Chrome extension content button with Generate, Drop, Open CTX, health checks, clearer failure states, refreshable capsule picker, and prompt insertion/copy fallback.
- GitHub capture flow for repositories, PRs, issues, README-style context, and coding-agent handoff capsules.
- Version timeline, latest-version diff, activity history, backup export/restore, MCP server tools, and project memory views.

Still needs production polish:

- Native-feeling extension placement for every supported platform.
- Optional hosted AI extraction with user-owned API keys and local fallback.
- True local embeddings for semantic search, duplicate detection, and related capsules.
- Archive, bulk cleanup, restore previous version, scheduled backups, and signed extension packaging.
- More guided onboarding with a first-run checklist and interactive sample data toggle.

## Product Principles

- Capture where the user already works.
- Make the default action one click.
- Keep memory local-first and inspectable.
- Never hide what will be injected into an AI tool.
- Let power users organize deeply without forcing beginners to do data entry.

## Phase 1: Make Capture Effortless

Goal: a user can generate and drop capsules from ChatGPT, Claude, Gemini, Perplexity, Cursor, and GitHub without opening the dashboard.

- Improve extension button placement per platform so it feels native beside each chat bar.
- Add Generate, Drop, Search, Recent, and Pin actions inside the extension panel.
- Capture selected text, full conversation, current prompt, last answer, GitHub issue, PR, README, and webpage text.
- Add a capture preview before saving so users can rename or reject bad captures.
- Add quick edit after capture for title, project, and tags only.
- Store capture source metadata: URL, platform, page title, selection/full-page mode, and timestamp.
- Add clear failure states when CTX web server is not running.

Acceptance criteria:

- New user can install extension, open ChatGPT, click Generate, and see a capsule in CTX in under 60 seconds.
- Drop inserts a capsule into the active prompt field on all supported platforms.
- No manual long-form fields appear in the primary capture flow.

## Phase 2: Better Capsule Intelligence

Goal: raw context becomes high-quality memory automatically.

- Add optional AI extraction provider with user-owned API key.
- Keep a local heuristic fallback for offline usage.
- Generate title, summary, tags, goals, decisions, constraints, open questions, next steps, and project linkage.
- Add confidence scores and "needs review" flags.
- Add duplicate detection before saving.
- Add capsule quality score based on summary, tags, source, freshness, and injection history.
- Add smart trimming to fit platform token budgets.
- Add redaction controls for secrets, emails, API keys, private keys, and custom patterns.

Acceptance criteria:

- Pasted or captured conversations become useful capsules without manual cleanup.
- Users can trust that sensitive patterns are redacted before storage.
- Low-quality capsules are visibly marked and easy to fix.

## Phase 3: Memory Retrieval That Feels Magical

Goal: users find the right memory without remembering exact words.

- Add local semantic search with embeddings stored in SQLite.
- Add hybrid search: keyword, tag, platform, project, recency, and semantic ranking.
- Add related capsules and "memory graph" links.
- Add pinned capsules and project defaults.
- Add recent/frequently dropped capsules in the extension.
- Add saved search filters for common workflows.
- Add natural language search: "what did I decide about extension injection?"

Acceptance criteria:

- Search works well even when the query does not match exact capsule text.
- Extension Drop panel surfaces useful capsules with minimal typing.
- Project pages show the most relevant context automatically.

## Phase 4: Project Memory Workspace

Goal: each project becomes a living memory system, not a pile of cards.

- Add project dashboard with goals, decisions, constraints, open questions, tasks, and recent capsules.
- Add project-level memory pack generation.
- Add "prepare context for this task" composer.
- Add decision log and timeline view.
- Add task state: planned, active, blocked, done.
- Add capsule dependencies and references.
- Add project health: stale questions, repeated bugs, unresolved decisions, missing next steps.

Acceptance criteria:

- A project page can brief an AI agent without manual searching.
- Users can see what changed, why, and what is still open.

## Phase 5: GitHub Deep Capture

Goal: CTX becomes excellent for coding-agent continuity.

- Capture issues, PR descriptions, review comments, inline threads, commits, README, release notes, and CI failures.
- Add PR review memory capsule templates.
- Add CI failure summarization and remediation memory.
- Add GitHub labels and milestones as capsule metadata.
- Add "generate handoff for coding agent" from PR or issue context.
- Add linked capsule references back to GitHub URLs.
- Add OAuth/GitHub App flow instead of raw token-only setup.

Acceptance criteria:

- One GitHub PR can become a complete agent handoff capsule.
- Review comments and CI failures are preserved as actionable memory.

## Phase 6: Editing, Versioning, and Trust

Goal: capsules are safe to evolve.

- Add visual diff between capsule versions.
- Add restore previous version.
- Add archive instead of only delete.
- Add bulk delete/archive/tag/project actions.
- Add source freshness warnings.
- Add manual merge for duplicate capsules.
- Add audit trail for generate, edit, import, export, drop, archive, and restore.

Acceptance criteria:

- Users can confidently change memory without losing old context.
- Cleanup is fast when many capsules exist.

## Phase 7: Backup, Sync, and Persistence

Goal: local-first memory is durable.

- Add one-click backup and restore UX.
- Add scheduled local backups.
- Add encrypted export bundle.
- Add optional cloud sync provider interface.
- Add conflict resolution for synced capsules.
- Add workspace migration commands.
- Add database repair and integrity checks.

Acceptance criteria:

- Users can move CTX memory between machines without fear.
- A broken local database can be diagnosed or restored.

## Phase 8: MCP and Agent Experience

Goal: coding agents and desktop AI apps can use CTX naturally.

- Add MCP resources for recent capsules, project memory, and pinned context.
- Add MCP prompts for generate handoff, summarize project, and retrieve task memory.
- Add MCP tool for semantic search.
- Add MCP tool for creating capsules from files/directories.
- Add Cursor and Claude Desktop setup validation.
- Add "agent mode" project briefing endpoint.

Acceptance criteria:

- Claude Desktop, Cursor, and other MCP clients can search and inject CTX memory without browser interaction.
- Project onboarding for an agent takes one command/tool call.

## Phase 9: Packaging and Distribution

Goal: CTX is easy for real users to install.

- Add desktop-friendly setup script for Windows, macOS, and Linux.
- Add signed Chrome extension package.
- Prepare Chrome Web Store assets.
- Add Docker Compose production profile.
- Add release automation with versioned artifacts.
- Add troubleshooting page and health checks.
- Add docs screenshots and short demo GIFs.

Acceptance criteria:

- A non-developer can install CTX with clear steps.
- A developer can self-host and hack on CTX quickly.

## Phase 10: Collaboration and Teams

Goal: teams can share memory without giving up privacy.

- Add team workspaces.
- Add encrypted shared capsule bundles.
- Add role-based permissions for read, write, export, and admin.
- Add review queue for shared capsules.
- Add organization-level redaction policy.
- Add team analytics for memory usage and stale context.

Acceptance criteria:

- A small team can share project memory while preserving control over sensitive context.

## Near-Term Build Order

1. Extension placement and reliability across ChatGPT, Claude, Gemini, Perplexity, Cursor, and GitHub.
2. Capture preview and quick edit.
3. AI extraction with local fallback.
4. Semantic search and related capsules.
5. Project memory dashboard.
6. GitHub deep PR/issue capture.
7. Version diff, archive, and bulk actions.
8. Backup/restore polish.
9. MCP resources and project briefing tools.
10. Packaging, docs, and demo assets.

## Metrics To Watch

- Time from install to first capsule.
- Time from chat context to saved capsule.
- Time from saved capsule to injected prompt.
- Percentage of generated capsules edited by the user.
- Duplicate capsule rate.
- Search success rate.
- Drop frequency per active user.
- Capsule reuse rate by project.
