import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CtxClient } from "./services/ctxClient.js";
import { collectFilesForCapsule } from "./services/fileCollector.js";
import { promptText, resourceResult, textResult } from "./services/formatter.js";

const client = new CtxClient();

export function createServer() {
  const server = new McpServer({
    name: "ctx",
    version: "0.1.0"
  });

  server.tool("ctx_search_capsules", "Search CTX capsules by title, summary, tags, raw text, or markdown.", { query: z.string() }, async ({ query }) =>
    textResult(await client.searchCapsules(query)),
  );

  server.tool(
    "ctx_semantic_search_capsules",
    "Search CTX capsules by meaning using CTX hybrid local retrieval.",
    { query: z.string(), limit: z.number().int().min(1).max(25).default(10) },
    async ({ query, limit }) => textResult((await client.searchCapsules(query)).slice(0, limit)),
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

  server.tool(
    "ctx_agent_brief",
    "Prepare an agent-ready project brief with related CTX memory for a concrete task.",
    {
      projectId: z.string().optional(),
      projectName: z.string().optional(),
      task: z.string().optional()
    },
    async (input) => textResult(await client.getAgentBrief(input)),
  );

  server.tool(
    "ctx_create_capsule_from_files",
    "Create a CTX capsule from local files or directories inside the MCP server working directory or CTX_MCP_ALLOWED_ROOTS.",
    {
      paths: z.array(z.string()).min(1).max(10),
      title: z.string().optional(),
      projectName: z.string().optional(),
      tags: z.array(z.string()).optional(),
      maxBytes: z.number().int().min(1_000).max(500_000).default(120_000),
      maxFiles: z.number().int().min(1).max(80).default(30)
    },
    async ({ paths, title, projectName, tags, maxBytes, maxFiles }) => {
      const collected = await collectFilesForCapsule({ paths, maxBytes, maxFiles });
      return textResult(
        await client.createCapsule({
          title: title ?? `File memory: ${paths[0]}`,
          summary: `Memory generated from ${collected.fileCount} local file${collected.fileCount === 1 ? "" : "s"}.`,
          rawText: collected.rawText,
          projectName,
          platform: "mcp",
          sourceType: "file_bundle",
          tags: tags ?? ["files", "agent-memory"]
        }),
      );
    },
  );

  server.tool("ctx_validate_setup", "Validate that the CTX web API is reachable from this MCP server.", {}, async () =>
    textResult(await client.validateSetup()),
  );

  server.registerResource(
    "ctx_recent_capsules",
    "ctx://capsules/recent",
    {
      title: "Recent CTX Capsules",
      description: "Most recently updated CTX capsules for agent context.",
      mimeType: "application/json"
    },
    async (uri) => resourceResult(uri.href, await client.listRecentCapsules(12)),
  );

  server.registerResource(
    "ctx_project_memory",
    new ResourceTemplate("ctx://projects/{projectName}/memory", {
      list: async () => ({
        resources: (await client.listProjects()).map((project) => ({
          uri: `ctx://projects/${encodeURIComponent(project.name)}/memory`,
          name: `${project.name} memory`,
          description: `Agent-ready CTX project memory for ${project.name}.`,
          mimeType: "application/json"
        }))
      })
    }),
    {
      title: "CTX Project Memory",
      description: "Structured project memory by project name.",
      mimeType: "application/json"
    },
    async (uri, variables) =>
      resourceResult(uri.href, await client.getProjectMemory({ projectName: decodeVariable(variables.projectName) })),
  );

  server.registerPrompt(
    "ctx_project_handoff",
    {
      title: "CTX Project Handoff",
      description: "Generate an agent handoff prompt from CTX project memory.",
      argsSchema: {
        projectName: z.string(),
        task: z.string().optional()
      }
    },
    async ({ projectName, task }) => {
      const brief = await client.getAgentBrief({ projectName, task });
      return promptText(
        `Use this CTX project memory to continue the work safely.\n\nTask: ${task ?? "Continue the project from the current memory."}\n\nCTX Agent Brief:\n${JSON.stringify(brief, null, 2)}`,
      );
    },
  );

  server.registerPrompt(
    "ctx_retrieve_task_memory",
    {
      title: "CTX Task Memory",
      description: "Retrieve relevant capsules and turn them into a compact task prompt.",
      argsSchema: {
        query: z.string(),
        task: z.string().optional()
      }
    },
    async ({ query, task }) => {
      const capsules = (await client.searchCapsules(query)).slice(0, 8);
      return promptText(
        `Use the following CTX capsules as prior memory for the task.\n\nTask: ${task ?? query}\n\nRelevant CTX capsules:\n${JSON.stringify(capsules, null, 2)}`,
      );
    },
  );

  return server;
}

export async function runServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function decodeVariable(value: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  return decodeURIComponent(raw);
}
