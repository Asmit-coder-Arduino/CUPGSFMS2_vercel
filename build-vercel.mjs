import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = process.cwd();
const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
};

console.log("=== VERCEL BUILD START ===");
console.log("Node:", process.version);
console.log("ROOT:", ROOT);

// 1. Install all deps (NODE_ENV=development so build tools like Vite are included)
run("pnpm install --no-frozen-lockfile", {
  env: { ...process.env, NODE_ENV: "development" },
});

// 2. Build frontend — Vite writes directly to /public at repo root via BUILD_OUT_DIR
//    BUILD_OUT_DIR is relative to the artifact dir (artifacts/bput-feedback)
//    so "../../public" resolves to <ROOT>/public/
run("pnpm --filter @workspace/bput-feedback run build", {
  env: {
    ...process.env,
    NODE_ENV: "production",
    BASE_PATH: "/",
    PORT: "3000",
    BUILD_OUT_DIR: "../../public",
  },
});

const publicDir = path.join(ROOT, "public");
console.log("\n--- Output check ---");
console.log("public/ exists:", existsSync(publicDir));
if (existsSync(publicDir)) {
  console.log("public/ contents:", readdirSync(publicDir).slice(0, 5));
}

console.log("\n=== VERCEL BUILD COMPLETE ===");
console.log("Output: public/");
