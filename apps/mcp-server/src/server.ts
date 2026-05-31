import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CtxClient } from "./services/ctxClient.js";
import { textResult } from "./services/formatter.js";

const client = new CtxClient();

export function createServer() {
  const server = new McpServer({
    name: "ctx",
    version: "0.1.0"
  });

  server.tool("ctx_search_capsules", "Search CTX capsules by title, summary, tags, raw text, or markdown.", { query: z.string() }, async ({ query }) =>
    textResult(await client.searchCapsules(query)),
  );

  server.tool("ctx_get_capsule", "Fetch one CTX capsule and return its structured memory.", { id: z.string() }, async ({ id }) =>
    textResult(await client.getCapsule(id)),
  );

  server.tool(
    "ctx_create_capsule",
    "Create a CTX capsule.",
    {
      title: z.string(),
      summary: z.string().optional(),
      rawText: z.string().optional(),
      tags: z.array(z.string()).optional()
    },
    async (input) => textResult(await client.createCapsule(input)),
  );

  server.tool(
    "ctx_update_capsule",
    "Update a CTX capsule.",
    {
      id: z.string(),
      fields: z.record(z.unknown())
    },
    async ({ id, fields }) => textResult(await client.updateCapsule(id, fields)),
  );

  server.tool("ctx_list_recent_capsules", "List recent CTX capsules.", { limit: z.number().int().min(1).max(50).default(10) }, async ({ limit }) =>
    textResult(await client.listRecentCapsules(limit)),
  );

  server.tool("ctx_export_capsule", "Export a CTX capsule in .ctx.json shape.", { id: z.string() }, async ({ id }) =>
    textResult(await client.exportCapsule(id)),
  );

  server.tool(
    "ctx_create_capsule_from_github",
    "Create a CTX capsule from a GitHub issue, pull request, README, or repository summary.",
    {
      owner: z.string(),
      repo: z.string(),
      type: z.enum(["issue", "pull_request", "readme", "repository"]),
      number: z.number().int().positive().optional()
    },
    async (input) => textResult(await client.createCapsuleFromGitHub(input)),
  );

  server.tool(
    "ctx_get_project_memory",
    "Return combined project memory for a CTX project.",
    {
      projectId: z.string().optional(),
      projectName: z.string().optional()
    },
    async (input) => textResult(await client.getProjectMemory(input)),
  );

  return server;
}

export async function runServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
