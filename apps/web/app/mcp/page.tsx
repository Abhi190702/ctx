import { MCPConfigSnippet } from "@/components/mcp/MCPConfigSnippet";
import { MCPSetupGuide } from "@/components/mcp/MCPSetupGuide";
import { MCPToolList } from "@/components/mcp/MCPToolList";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export default function MCPPage() {
  return (
    <PageShell>
      <PageHeader
        title="MCP Server"
        description="Expose CTX memory to Claude Desktop, Cursor, Windsurf, and any MCP-compatible client."
      />
      <div className="space-y-6">
        <MCPSetupGuide />
        <MCPConfigSnippet />
        <MCPToolList />
      </div>
    </PageShell>
  );
}
