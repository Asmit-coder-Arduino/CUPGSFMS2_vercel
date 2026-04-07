# Netlify Deployment Guide — BPUT CUPGS Feedback Manager

## Quick Deploy Steps

### 1. Download the Project
Download the entire project folder from Replit.

### 2. Push to GitHub (Recommended)
- Create a new GitHub repository
- Push the project to GitHub
- Connect the GitHub repo to Netlify

### 3. Netlify Configuration (Already Set Up)
The `netlify.toml` file is already configured. Netlify will automatically:
- Build the frontend (React + Vite)
- Bundle the API as a serverless function
- Set up SPA routing and API redirects

### 4. Environment Variables (REQUIRED)
In Netlify Dashboard -> Site Settings -> Environment Variables, add these for **Runtime only** (not during build):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iunbsqbpsdxrnmdbjjjs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Your Supabase anon key |
| `ADMIN_PASSWORD` | Your chosen admin password |
| `ALLOWED_ORIGINS` | `*` (or your Netlify domain) |

Optional (for AI Analytics):

| Variable | Value |
|----------|-------|
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Your OpenAI base URL |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Your OpenAI API key |

**Important**: Do NOT set `NODE_ENV=production` during build — the build script handles this automatically. Only set it for the runtime (Functions) context if needed.

### 5. Deploy
Click "Deploy site" — Netlify handles everything automatically.

## What Happens During Build
1. `pnpm install` — installs all dependencies (including dev dependencies for build tools)
2. API server builds into a single self-contained serverless function (`netlify/functions/api.mjs`)
3. Frontend builds as static files (`artifacts/bput-feedback/dist/public/`)
4. Netlify serves static files + routes `/api/*` to the serverless function

## Architecture on Netlify
- **Frontend**: Static files served by Netlify CDN
- **API**: Runs as Netlify Serverless Function (Node.js 20)
- **Database**: Supabase (external, no changes needed)
- **SPA Routing**: All non-API routes -> `index.html`

## Troubleshooting
- If build fails with missing modules, ensure `NODE_ENV` is not set to `production` during build
- If API calls return 404, check that environment variables are set in Netlify
- The API function is fully self-contained (3.2MB) — no external node_modules needed at runtime
