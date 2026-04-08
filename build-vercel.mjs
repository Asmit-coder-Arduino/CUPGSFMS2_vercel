import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Use both methods to determine root — whichever is correct on Vercel's CI
const ROOT_FROM_URL = path.dirname(fileURLToPath(import.meta.url));
const ROOT_FROM_CWD = process.cwd();

console.log("=== VERCEL BUILD START ===");
console.log("Node:", process.version);
console.log("ROOT (import.meta.url):", ROOT_FROM_URL);
console.log("ROOT (process.cwd):", ROOT_FROM_CWD);

// Use CWD as the authoritative root (where vercel.json lives)
const ROOT = ROOT_FROM_CWD;

const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

// 1. Install all deps
run("pnpm install --no-frozen-lockfile", {
  env: { ...process.env, NODE_ENV: "development" },
});

// 2. Build the frontend
run("pnpm --filter @workspace/bput-feedback run build", {
  env: { ...process.env, NODE_ENV: "production", BASE_PATH: "/", PORT: "3000" },
});

// 3. Copy to public/ where Vercel expects it
const src = path.join(ROOT, "artifacts/bput-feedback/dist/public");
const dest = path.join(ROOT, "public");

console.log("\n--- Copying output to public/ ---");
console.log("src:", src, "| exists:", existsSync(src));
console.log("dest:", dest);

if (!existsSync(src)) {
  console.error("ERROR: src directory does not exist:", src);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

console.log("dest exists after copy:", existsSync(dest));
console.log("dest contents:", readdirSync(dest).slice(0, 5));

console.log("\n=== VERCEL BUILD COMPLETE ===");
console.log("Output: public/");
