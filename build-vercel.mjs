/**
 * Root-level Vercel build orchestrator.
 * Run via: node build-vercel.mjs
 * Invoked by: pnpm run build:vercel (defined in root package.json)
 */
import { execSync } from "node:child_process";
import { mkdirSync, cpSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

console.log("=== VERCEL BUILD START ===");
console.log(`Node: ${process.version}`);

// ── 1. Install dependencies (dev + prod) ──────────────────────────────────────
console.log("\n--- Installing dependencies ---");
run("pnpm install --no-frozen-lockfile", { env: { ...process.env, NODE_ENV: "development" } });

// ── 2. Build API serverless function ──────────────────────────────────────────
console.log("\n--- Building API serverless function ---");
run("node build-vercel.mjs", { cwd: path.join(ROOT, "artifacts/api-server") });

// ── 3. Build frontend ─────────────────────────────────────────────────────────
console.log("\n--- Building frontend ---");
run("pnpm --filter @workspace/bput-feedback run build", {
  env: { ...process.env, NODE_ENV: "production", BASE_PATH: "/", PORT: "3000" },
});

// ── 4. Assemble Vercel Build Output API structure ─────────────────────────────
console.log("\n--- Assembling Vercel Build Output ---");
const vercelOut = path.join(ROOT, ".vercel/output");
const staticDir = path.join(vercelOut, "static");
const funcDir = path.join(vercelOut, "functions/api.func");

mkdirSync(staticDir, { recursive: true });
mkdirSync(funcDir, { recursive: true });

// Copy frontend build
const frontendDist = path.join(ROOT, "artifacts/bput-feedback/dist/public");
cpSync(frontendDist, staticDir, { recursive: true });

// Write function config
writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: true,
    },
    null,
    2
  )
);

// Write routing config
writeFileSync(
  path.join(vercelOut, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: "/api/(.*)", dest: "/api" },
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2
  )
);

console.log("\n=== VERCEL BUILD COMPLETE ===");
console.log("  Frontend  -> .vercel/output/static/");
console.log("  API Func  -> .vercel/output/functions/api.func/");
