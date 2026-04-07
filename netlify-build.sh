#!/bin/bash
set -e

echo "=== NETLIFY BUILD START ==="
echo "Node version: $(node -v)"

echo "--- Setting up pnpm ---"
corepack enable 2>/dev/null || true
corepack prepare pnpm@latest --activate 2>/dev/null || npm install -g pnpm 2>/dev/null || true
echo "pnpm version: $(pnpm -v)"

echo "--- Installing dependencies ---"
NODE_ENV=development pnpm install --no-frozen-lockfile

echo "--- Building API serverless function ---"
cd artifacts/api-server
node build-netlify.mjs
cd ../..

echo "--- Building frontend ---"
export BASE_PATH="/"
export PORT=3000
pnpm --filter @workspace/bput-feedback run build

echo "=== NETLIFY BUILD COMPLETE ==="
echo "Frontend: artifacts/bput-feedback/dist/public"
echo "Function: netlify/functions/api.mjs"
