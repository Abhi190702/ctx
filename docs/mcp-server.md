# MCP Server

The CTX MCP server lets AI tools access local CTX memory through the CTX web API.

## Run

```bash
pnpm mcp:dev
```

Set `CTX_API_URL` if needed:

```bash
CTX_API_URL=http://localhost:3000/api pnpm mcp:dev
```

## Tools

- `ctx_search_capsules`
- `ctx_semantic_search_capsules`
- `ctx_get_capsule`
- `ctx_create_capsule`
- `ctx_update_capsule`
- `ctx_list_recent_capsules`
- `ctx_export_capsule`
- `ctx_create_capsule_from_github`
- `ctx_get_project_memory`
- `ctx_agent_brief`
- `ctx_create_capsule_from_files`
- `ctx_validate_setup`

## Resources

- `ctx://capsules/recent` returns recently updated capsules as JSON.
- `ctx://projects/{projectName}/memory` returns the structured project memory workspace for a project.

## Prompts

- `ctx_project_handoff` prepares an agent-ready continuation prompt from project memory.
- `ctx_retrieve_task_memory` searches CTX memory and returns a compact task prompt.

## Local File Capture

`ctx_create_capsule_from_files` reads local files/directories from the MCP server working directory. To allow another workspace root, set `CTX_MCP_ALLOWED_ROOTS` before starting the server.

On Windows:

```powershell
$env:CTX_MCP_ALLOWED_ROOTS="C:\Users\you\code\project"
pnpm mcp:dev
```

On macOS/Linux:

```bash
CTX_MCP_ALLOWED_ROOTS=/Users/you/code/project pnpm mcp:dev
```

The server never fabricates GitHub data. It calls the web API, which calls the official GitHub REST API when `GITHUB_TOKEN` is configured.
