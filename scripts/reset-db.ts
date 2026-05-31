import { execSync } from "node:child_process";

execSync("pnpm --filter @ctx/web db:reset", { stdio: "inherit" });
