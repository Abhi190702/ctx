import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as { version?: string };
const version = packageJson.version ?? "0.0.0";
const releaseRoot = path.join(root, "release");
const target = path.join(releaseRoot, `ctx-v${version}`);
const skipBuild = process.argv.includes("--skip-build");

if (!skipBuild) {
  runPnpm(["build"]);
}

await assertExists(path.join(root, "apps", "extension", "dist"), "Extension dist is missing. Run pnpm --filter @ctx/extension build.");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

await copyIfExists("README.md");
await copyIfExists("LICENSE");
await copyIfExists("SECURITY.md");
await copyIfExists("CHANGELOG.md");
await cp(path.join(root, "docs"), path.join(target, "docs"), { recursive: true });
await cp(path.join(root, "examples"), path.join(target, "examples"), { recursive: true });
await cp(path.join(root, "docker"), path.join(target, "docker"), { recursive: true });
await cp(path.join(root, "apps", "extension", "dist"), path.join(target, "extension-unpacked"), { recursive: true });

await writeFile(path.join(target, "INSTALL.md"), installGuide(version), "utf8");
await writeFile(path.join(target, "release-manifest.json"), JSON.stringify(await buildManifest(), null, 2), "utf8");
await writeFile(path.join(target, "CHECKSUMS.txt"), await buildChecksums(target), "utf8");

console.log(`Release artifacts staged at ${path.relative(root, target)}`);

function runPnpm(args: string[]) {
  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`pnpm ${args.join(" ")} failed.`);
  }
}

async function copyIfExists(relativePath: string) {
  const source = path.join(root, relativePath);
  if (await exists(source)) {
    await cp(source, path.join(target, relativePath), { recursive: true });
  }
}

async function buildManifest() {
  return {
    name: "ctx",
    version,
    createdAt: new Date().toISOString(),
    gitCommit: getGitCommit(),
    artifacts: {
      web: "Build from repository source with pnpm build && pnpm start.",
      extension: "extension-unpacked",
      docker: "docker/docker-compose.yml",
      mcpExamples: "examples/mcp"
    }
  };
}

function getGitCommit() {
  const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

async function buildChecksums(directory: string) {
  const files = await listFiles(directory);
  const rows = [];
  for (const file of files) {
    const buffer = await readFile(file);
    rows.push(`${createHash("sha256").update(buffer).digest("hex")}  ${path.relative(directory, file).replace(/\\/g, "/")}`);
  }
  return `${rows.sort().join("\n")}\n`;
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function assertExists(filePath: string, message: string) {
  if (!(await exists(filePath))) throw new Error(message);
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function installGuide(releaseVersion: string) {
  return `# CTX v${releaseVersion} Install Notes

## Web App

1. Install Node.js 20 or newer and pnpm 9.15 or newer.
2. From the repository root, run:

\`\`\`bash
pnpm install
pnpm db:push
pnpm build
pnpm start
\`\`\`

Open http://localhost:3000.

## Browser Extension

1. Open chrome://extensions.
2. Enable Developer Mode.
3. Click Load unpacked.
4. Select this release folder's extension-unpacked directory.
5. Keep the CTX web app running.

## MCP

Use the examples in examples/mcp for Claude Desktop and Cursor. If CTX runs on a different URL, set CTX_API_URL before starting the MCP server.

## Docker

Use docker/docker-compose.yml for a local production-style stack.

## Integrity

Compare files against CHECKSUMS.txt after copying this release folder to another machine.
`;
}
