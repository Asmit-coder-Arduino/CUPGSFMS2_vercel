import { execSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

console.log("=== VERCEL BUILD START ===");
console.log("Node:", process.version);

// 1. Install all deps (NODE_ENV=development so build tools are included)
run("pnpm install --no-frozen-lockfile", {
  env: { ...process.env, NODE_ENV: "development" },
});

// 2. Build the frontend with Vite
run("pnpm --filter @workspace/bput-feedback run build", {
  env: { ...process.env, NODE_ENV: "production", BASE_PATH: "/", PORT: "3000" },
});

// 3. Copy frontend output to /public at repo root (Vercel's expected output dir)
const src = path.join(ROOT, "artifacts/bput-feedback/dist/public");
const dest = path.join(ROOT, "public");
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });

console.log("\n=== VERCEL BUILD COMPLETE ===");
console.log("Output copied to: public/");
