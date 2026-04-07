#!/bin/bash
set -e

echo "=== NETLIFY BUILD START ==="

echo "--- Installing dependencies (including devDependencies) ---"
corepack enable 2>/dev/null || true
corepack prepare pnpm@10.26.1 --activate 2>/dev/null || npm install -g pnpm@10.26.1 2>/dev/null || true
NODE_ENV=development pnpm install --frozen-lockfile || NODE_ENV=development pnpm install

echo "--- Building API server for serverless ---"
cd artifacts/api-server
node build-netlify.mjs
cd ../..

echo "--- Building frontend ---"
export BASE_PATH="/"
export PORT=3000
cd artifacts/bput-feedback
pnpm run build
cd ../..

echo "=== NETLIFY BUILD COMPLETE ==="
