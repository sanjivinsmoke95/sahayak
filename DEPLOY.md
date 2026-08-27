# Deploying Sahayak to a live link (Render)

Sahayak is a full-stack app (Next.js + FastAPI + Postgres), so it needs a host
that runs servers and a database — GitHub Pages can't run it. The included
`render.yaml` deploys the whole thing on [Render](https://render.com)'s free tier
straight from this GitHub repo.

## One-time setup

1. Push is already done — the repo is at
   `https://github.com/sanjivinsmoke95/sahayak`.
2. Create a free Render account and connect your GitHub.
3. Render Dashboard → **New → Blueprint** → select this repo. Render reads
   `render.yaml` and shows three resources: **sahayak-db**, **sahayak-api**,
   **sahayak-web**. Click **Apply**.
4. Wait for the first build (a few minutes). The backend creates its own tables
   on first boot, so there's no migration step.

Your live link is the **sahayak-web** service URL:
`https://sahayak-web.onrender.com`.

## Two things to check after the first deploy

- **Backend URL match.** `render.yaml` points the frontend's `BACKEND_URL` at
  `https://sahayak-api.onrender.com`. If that name was taken and Render gave the
  API a different URL, open **sahayak-web → Environment**, set `BACKEND_URL` to
  the real API URL, and redeploy the frontend.
- **Free services sleep.** After ~15 min idle they cold-start on the next
  request (first load is slow). That's normal on the free plan.

## Optional secrets (add in each service's Environment tab)

All optional — the app runs without them (rule-based explanations, list-only
Mee Seva, anonymous sign-in):

| Variable | Service | Purpose |
|---|---|---|
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | sahayak-api | richer AI explanations (also set `DEFAULT_AI_PROVIDER`) |
| `GOOGLE_MAPS_API_KEY` | sahayak-api | Mee Seva centre search (server-side Places key) |
| `GOOGLE_MAPS_BROWSER_KEY` | sahayak-api | interactive map (referrer-restricted Maps JS key) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | sahayak-api | durable uploads (free tier disk is otherwise ephemeral) |
| `CLERK_ISSUER` + `CLERK_SECRET_KEY` + `CLERK_AUDIENCE` | sahayak-api | real sign-in |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | sahayak-web | Clerk sign-in in the browser |

> Never commit these — add them only in the Render dashboard.

## Notes

- The **government-data collector** service isn't in the blueprint (it needs
  pgvector and heavier crawling); the app runs fine without it, using its
  seeded scheme data. Add it later as a separate Docker service if you want live
  crawling.
- To use another host (Railway, Fly.io, Vercel+Neon), the same env vars apply;
  the frontend needs `BACKEND_URL`, the backend needs `DATABASE_URL`.
