import { CTX_MCP_TOOLS } from "@ctx/core";
import { Card } from "@/components/ui/card";

export function MCPToolList() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Available MCP Tools</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CTX_MCP_TOOLS.map((tool) => (
          <code key={tool} className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
            {tool}
          </code>
        ))}
      </div>
    </Card>
  );
}
