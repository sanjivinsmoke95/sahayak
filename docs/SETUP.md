# Setup

## Prerequisites

- Node 18 or newer
- Python 3.11 or newer
- Docker (for PostgreSQL), or your own PostgreSQL 14+

## First run

```bash
docker compose up -d db

cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The API docs are at http://localhost:8000/docs.

On a desktop the app draws itself inside a phone frame. Chrome DevTools device
mode (Ctrl/Cmd-Shift-M) shows the real edge-to-edge layout.

## Optional integrations

Each is off until its keys are present, and the app works without all of them.

### Clerk (authentication)

1. Create an application at https://dashboard.clerk.com
2. `frontend/.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. `backend/.env`:
   ```
   CLERK_ISSUER=https://your-app.clerk.accounts.dev
   ```

Until then every request runs as a single development user, and the backend
logs a warning at startup saying so.

### Supabase (file storage)

Create a **private** bucket — these are identity documents — and set:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_BUCKET=sahayak-documents
```

The service key is backend-only. Never expose it to the browser. Download
links are short-lived signed URLs, not public ones.

### AI providers

Set any of these; whichever have keys become selectable models.

```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
DEFAULT_AI_PROVIDER=anthropic
```

With none set, `DEFAULT_AI_PROVIDER=rule-based` answers from the extracted
document fields. The catalogue is reconciled against the configured keys at
startup, so the picker never offers a provider that would fail.

## Migrations

```bash
cd backend
alembic revision --autogenerate -m "what changed"
alembic upgrade head
alembic downgrade -1
```

`alembic/env.py` reads `DATABASE_URL` through `app.config`, so `alembic.ini`
needs no URL in it.

## Tests

```bash
cd backend  && python -m pytest -q      # 16 tests
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

## Troubleshooting

**`asyncpg` missing** — install `backend/requirements.txt` inside the venv.

**Frontend calls 404** — `BACKEND_URL` in `frontend/.env.local` must match
where uvicorn is listening. The browser calls `/api/...` and Next rewrites it,
which is why there is no CORS problem in development.

**`useAuth can only be used within ClerkProvider`** — a publishable key is set
in `.env.local` but the app was not restarted. Next reads `NEXT_PUBLIC_*` at
build time.
