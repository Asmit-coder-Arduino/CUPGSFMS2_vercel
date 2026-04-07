import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm, mkdir } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(artifactDir, "../..");
const outDir = path.resolve(rootDir, "netlify/functions");

async function buildForNetlify() {
  await mkdir(outDir, { recursive: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/netlify-function.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: path.resolve(outDir, "api.mjs"),
    logLevel: "info",
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
    ],
    sourcemap: false,
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
      `,
    },
  });

  console.log("Netlify function built -> netlify/functions/api.mjs");
}

buildForNetlify().catch((err) => {
  console.error(err);
  process.exit(1);
});
