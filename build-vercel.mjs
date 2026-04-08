import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

console.log("=== VERCEL BUILD START ===");
console.log("Node:", process.version);

run("pnpm install --no-frozen-lockfile", {
  env: { ...process.env, NODE_ENV: "development" },
});

run("pnpm --filter @workspace/bput-feedback run build", {
  env: { ...process.env, NODE_ENV: "production", BASE_PATH: "/", PORT: "3000" },
});

console.log("\n=== VERCEL BUILD COMPLETE ===");
console.log("Output: artifacts/bput-feedback/dist/public/");
