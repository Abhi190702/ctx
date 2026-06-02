import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <CopyButton value={value} />
      </div>
      <pre className="mt-4 overflow-auto rounded-xl border border-line bg-ink p-4 text-sm leading-6 text-foreground">{value}</pre>
    </Card>
  );
}
