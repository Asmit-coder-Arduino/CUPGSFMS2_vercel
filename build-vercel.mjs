import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = process.cwd();
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

console.log("=== VERCEL BUILD START ===");
console.log("Node:", process.version, "| ROOT:", ROOT);

// 1. Install all deps (NODE_ENV=development so Vite/esbuild are included)
run("pnpm install --no-frozen-lockfile", {
  env: { ...process.env, NODE_ENV: "development" },
});

// 2. Build frontend — Vite outputs to artifacts/bput-feedback/dist/public
run("pnpm --filter @workspace/bput-feedback run build", {
  env: { ...process.env, NODE_ENV: "production", BASE_PATH: "/", PORT: "3000" },
});

// 3. Set up Vercel Build Output API (.vercel/output/)
//    This is recognised by Vercel CLI regardless of any dashboard/vercel.json
//    outputDirectory setting — it is the most authoritative output mechanism.
const OUTPUT = path.join(ROOT, ".vercel/output");
const STATIC = path.join(OUTPUT, "static");
const FUNC_DIR = path.join(OUTPUT, "functions/api/index.func");

mkdirSync(STATIC, { recursive: true });
mkdirSync(FUNC_DIR, { recursive: true });

// 3a. Write routing config
writeFileSync(
  path.join(OUTPUT, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { src: "/api/(.*)", dest: "/api/index" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ],
  })
);

// 3b. Copy frontend static files into .vercel/output/static/
const frontendDist = path.join(ROOT, "artifacts/bput-feedback/dist/public");
console.log("\n--- Copying frontend to .vercel/output/static/ ---");
console.log("src exists:", existsSync(frontendDist));
cpSync(frontendDist, STATIC, { recursive: true });
console.log("static/ populated");

// 3c. Bundle Express API into a single file for the serverless function
console.log("\n--- Bundling API function ---");
const esbuild = path.join(ROOT, "node_modules/.bin/esbuild");
run(
  `${esbuild} api/index.ts` +
    ` --bundle --platform=node --target=node20 --format=cjs` +
    ` --external:fsevents --external:pg-native` +
    ` --outfile=${FUNC_DIR}/index.js`
);

// 3d. Write the Vercel function config
writeFileSync(
  path.join(FUNC_DIR, ".vc-config.json"),
  JSON.stringify({ runtime: "nodejs20.x", handler: "index.js", launchWorker: true })
);

console.log("\n=== VERCEL BUILD COMPLETE ===");
console.log("Static: .vercel/output/static/");
console.log("Function: .vercel/output/functions/api/index.func/");
