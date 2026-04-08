# Vercel Deployment Guide — BPUT CUPGS Feedback Manager

## Quick Deploy Steps

### 1. Push to GitHub
Push this entire project folder to a GitHub repository.

### 2. Import to Vercel
- Go to [vercel.com](https://vercel.com) → **Add New Project**
- Import your GitHub repository
- Leave the **Root Directory** as the default (repo root)
- Vercel will auto-detect `vercel.json` — click **Deploy** immediately

> **No build settings to change.** `vercel.json` and `vercel-build.sh` handle everything automatically.

### 3. Set Environment Variables (REQUIRED)
In Vercel Dashboard → Project → **Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iunbsqbpsdxrnmdbjjjs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Your Supabase anon key |
| `ADMIN_PASSWORD` | Your chosen admin password |
| `ALLOWED_ORIGINS` | `*` (or your Vercel domain) |

Optional (for AI Analytics):

| Variable | Value |
|----------|-------|
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Your OpenAI base URL |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Your OpenAI API key |

### 4. Redeploy After Adding Variables
After adding environment variables, trigger a new deployment so they take effect.

---

## What Happens During Build

1. `pnpm install` — installs all monorepo dependencies
2. API server is bundled into a single Node.js serverless function
3. Frontend is built as static files with Vite
4. Vercel Build Output API structure is assembled in `.vercel/output/`

## Architecture on Vercel

- **Frontend**: Static files served by Vercel CDN
- **API**: Runs as Vercel Serverless Function (Node.js 20)
- **Database**: Supabase (external, no changes needed)
- **Routing**: `/api/*` → serverless function; everything else → `index.html` (SPA)

## Troubleshooting

- **Build fails with "pnpm not found"**: Vercel should install pnpm via corepack automatically. If not, add `NPM_FLAGS=--legacy-peer-deps` in environment variables.
- **API returns 500**: Check that all environment variables are set correctly in Vercel dashboard.
- **Blank page**: Clear browser cache and hard-refresh. Check that `NEXT_PUBLIC_SUPABASE_URL` is set.
- **Liquid effect not working**: This has been fixed — the effect is now embedded directly in CSS with no external references.
