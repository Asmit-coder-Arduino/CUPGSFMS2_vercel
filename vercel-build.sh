#!/bin/bash
set -e

echo "=== VERCEL BUILD START ==="
echo "Node version: $(node -v)"

echo "--- Setting up pnpm ---"
corepack enable 2>/dev/null || true
corepack prepare pnpm@latest --activate 2>/dev/null || npm install -g pnpm 2>/dev/null || true
echo "pnpm version: $(pnpm -v)"

echo "--- Installing dependencies (dev + prod) ---"
NODE_ENV=development pnpm install --no-frozen-lockfile

echo "--- Building API serverless function ---"
cd artifacts/api-server
node build-vercel.mjs
cd ../..

echo "--- Building frontend ---"
export BASE_PATH="/"
export PORT=3000
NODE_ENV=production pnpm --filter @workspace/bput-feedback run build

echo "--- Assembling Vercel Build Output API structure ---"
mkdir -p .vercel/output/static

cp -r artifacts/bput-feedback/dist/public/. .vercel/output/static/

cat > .vercel/output/functions/api.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.mjs",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true
}
EOF

cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

echo ""
echo "=== VERCEL BUILD COMPLETE ==="
echo "  Frontend  -> .vercel/output/static/"
echo "  API Func  -> .vercel/output/functions/api.func/"
