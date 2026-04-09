/**
 * Run this script locally whenever you change code and want to push a new
 * Vercel deployment:
 *
 *   node build-vercel.mjs
 *
 * It rebuilds the frontend and API into .vercel/output/ (pre-built mode).
 * Commit the result and push — Vercel will deploy it directly without
 * running a build step.
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

console.log("=== Building Vercel pre-built output ===\n");

// 1. Build frontend
run("pnpm --filter @workspace/bput-feedback run build", {
  env: { ...process.env, NODE_ENV: "production", BASE_PATH: "/", PORT: "3000" },
});

// 2. Set up .vercel/output/
const OUTPUT = path.join(ROOT, ".vercel/output");
const STATIC = path.join(OUTPUT, "static");
const FUNC_DIR = path.join(OUTPUT, "functions/api/index.func");

rmSync(STATIC, { recursive: true, force: true });
mkdirSync(STATIC, { recursive: true });
mkdirSync(FUNC_DIR, { recursive: true });

// 3. Copy frontend → .vercel/output/static/
const frontendDist = path.join(ROOT, "artifacts/bput-feedback/dist/public");
cpSync(frontendDist, STATIC, { recursive: true });
console.log("\nFrontend copied to .vercel/output/static/");

// 4. Bundle API → .vercel/output/functions/api/index.func/index.js
const esbuild = path.join(ROOT, "node_modules/.bin/esbuild");
run(
  `${esbuild} api/index.ts` +
    ` --bundle --platform=node --target=node20 --format=cjs` +
    ` --external:fsevents --external:pg-native` +
    ` --outfile=${FUNC_DIR}/index.js`
);

// 5. Write function config (idempotent — also committed in repo)
writeFileSync(
  path.join(FUNC_DIR, ".vc-config.json"),
  JSON.stringify({ runtime: "nodejs20.x", handler: "index.js", launchWorker: true })
);
writeFileSync(
  path.join(OUTPUT, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { src: "/api/(.*)", dest: "/api/index" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ],
  }, null, 2)
);

console.log("\n=== Done — commit .vercel/output/ and push to deploy ===");
