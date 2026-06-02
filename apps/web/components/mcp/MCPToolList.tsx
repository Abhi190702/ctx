import { CTX_MCP_TOOLS } from "@ctx/core";
import { Card } from "@/components/ui/card";

export function MCPToolList() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground">Available MCP Tools</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CTX_MCP_TOOLS.map((tool) => (
          <code key={tool} className="rounded-xl border border-line bg-ink px-3 py-2 text-sm text-foreground">
            {tool}
          </code>
        ))}
      </div>
    </Card>
  );
}
