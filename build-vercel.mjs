/**
 * Root-level Vercel build orchestrator.
 * Invoked by: pnpm -w run build:vercel
 *
 * Vercel handles API function bundling automatically from api/index.ts.
 * This script just installs deps and builds the frontend.
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

console.log("=== VERCEL BUILD START ===");
console.log(`Node: ${process.version}`);

// ── 1. Install all dependencies (dev + prod so build tools are available) ─────
console.log("\n--- Installing dependencies ---");
run("pnpm install --no-frozen-lockfile", {
  env: { ...process.env, NODE_ENV: "development" },
});

// ── 2. Build frontend ─────────────────────────────────────────────────────────
console.log("\n--- Building frontend ---");
run("pnpm --filter @workspace/bput-feedback run build", {
  env: { ...process.env, NODE_ENV: "production", BASE_PATH: "/", PORT: "3000" },
});

console.log("\n=== VERCEL BUILD COMPLETE ===");
console.log("  Frontend -> artifacts/bput-feedback/dist/public/");
console.log("  API      -> Vercel auto-bundles api/index.ts");
