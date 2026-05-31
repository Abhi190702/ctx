import { execSync } from "node:child_process";

execSync("pnpm install", { stdio: "inherit" });
execSync("pnpm db:push", { stdio: "inherit" });
