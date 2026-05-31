# CTX MCP Server

The CTX MCP server exposes local CTX capsules to Claude Desktop, Cursor, Windsurf, and other MCP-compatible clients.

## Run

```bash
pnpm mcp:dev
```

Set `CTX_API_URL` if the web app is not running on the default API URL:

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

The server calls the CTX web API. If the API is offline, tools return a clear setup error instead of fake data.
