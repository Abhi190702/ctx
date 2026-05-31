import { Card } from "@/components/ui/card";

export function MCPSetupGuide() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">How CTX MCP Works</h2>
      <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        <li>1. Run the CTX web app locally so the API is available at http://localhost:3000/api.</li>
        <li>2. Start the MCP server with pnpm mcp:dev or build it for a stable Node command.</li>
        <li>3. Add the config snippet to Claude Desktop, Cursor, Windsurf, or another MCP client.</li>
        <li>4. Ask your AI client to search, fetch, create, or export CTX capsules.</li>
      </ol>
    </Card>
  );
}
