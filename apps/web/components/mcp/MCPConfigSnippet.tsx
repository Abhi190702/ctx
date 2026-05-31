import { Card } from "@/components/ui/card";

const claudeConfig = `{
  "mcpServers": {
    "ctx": {
      "command": "node",
      "args": ["./apps/mcp-server/dist/index.js"],
      "env": {
        "CTX_API_URL": "http://localhost:3000/api"
      }
    }
  }
}`;

const cursorConfig = `{
  "ctx": {
    "command": "pnpm",
    "args": ["--filter", "@ctx/mcp-server", "dev"],
    "env": {
      "CTX_API_URL": "http://localhost:3000/api"
    }
  }
}`;

export function MCPConfigSnippet() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Snippet title="Claude Desktop" value={claudeConfig} />
      <Snippet title="Cursor / Windsurf" value={cursorConfig} />
    </div>
  );
}

function Snippet({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <pre className="mt-4 overflow-auto rounded-lg border border-line bg-ink p-4 text-sm leading-6 text-mint">{value}</pre>
    </Card>
  );
}
