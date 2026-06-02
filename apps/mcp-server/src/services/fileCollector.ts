import { promises as fs } from "node:fs";
import path from "node:path";

const ignoredDirectories = new Set([".git", ".next", "coverage", "dist", "node_modules"]);
const textFileExtensions = new Set([
  ".cjs",
  ".css",
  ".env",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".prisma",
  ".ps1",
  ".py",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml"
]);

export async function collectFilesForCapsule(input: { paths: string[]; maxBytes?: number; maxFiles?: number }) {
  const maxBytes = input.maxBytes ?? 120_000;
  const maxFiles = input.maxFiles ?? 30;
  const allowedRoots = getAllowedRoots();
  const files: string[] = [];

  for (const requestedPath of input.paths) {
    const resolved = assertAllowedPath(requestedPath, allowedRoots);
    await collectPath(resolved, files, maxFiles);
    if (files.length >= maxFiles) break;
  }

  let usedBytes = 0;
  const sections: string[] = [];
  for (const file of files.slice(0, maxFiles)) {
    const stats = await fs.stat(file);
    if (!stats.isFile()) continue;
    if (!isTextLike(file)) continue;
    if (usedBytes >= maxBytes) break;

    const raw = await fs.readFile(file, "utf8");
    const remaining = maxBytes - usedBytes;
    const content = raw.length > remaining ? `${raw.slice(0, remaining)}\n[truncated]` : raw;
    usedBytes += Buffer.byteLength(content, "utf8");
    sections.push(`## ${path.relative(process.cwd(), file)}\n\n${content}`);
  }

  if (!sections.length) {
    throw new Error("No readable text files were found in the requested paths.");
  }

  return {
    fileCount: sections.length,
    byteCount: usedBytes,
    rawText: sections.join("\n\n---\n\n")
  };
}

async function collectPath(resolvedPath: string, files: string[], maxFiles: number) {
  if (files.length >= maxFiles) return;

  const stats = await fs.stat(resolvedPath);
  if (stats.isFile()) {
    files.push(resolvedPath);
    return;
  }

  if (!stats.isDirectory()) return;
  const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
  for (const entry of entries) {
    if (files.length >= maxFiles) return;
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    await collectPath(path.join(resolvedPath, entry.name), files, maxFiles);
  }
}

function getAllowedRoots() {
  const configured = (process.env.CTX_MCP_ALLOWED_ROOTS ?? "")
    .split(path.delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
  return [process.cwd(), ...configured].map((root) => path.resolve(root));
}

function assertAllowedPath(inputPath: string, allowedRoots: string[]) {
  const resolved = path.resolve(inputPath);
  const normalized = normalizePath(resolved);
  const allowed = allowedRoots.some((root) => {
    const normalizedRoot = normalizePath(root);
    return normalized === normalizedRoot || normalized.startsWith(`${normalizedRoot}${path.sep}`);
  });
  if (!allowed) {
    throw new Error(`MCP file capture can only read inside allowed roots. Add CTX_MCP_ALLOWED_ROOTS to allow: ${resolved}`);
  }
  return resolved;
}

function normalizePath(value: string) {
  return path.resolve(value).toLowerCase();
}

function isTextLike(file: string) {
  return textFileExtensions.has(path.extname(file).toLowerCase());
}
