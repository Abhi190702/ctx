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
- `ctx_get_capsule`
- `ctx_create_capsule`
- `ctx_update_capsule`
- `ctx_list_recent_capsules`
- `ctx_export_capsule`
- `ctx_create_capsule_from_github`
- `ctx_get_project_memory`

The server never fabricates GitHub data. It calls the web API, which calls the official GitHub REST API when `GITHUB_TOKEN` is configured.
