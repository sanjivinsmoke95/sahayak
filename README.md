# SAHAYAK

Government paperwork, explained in the reader's own language.

SAHAYAK takes a government notice — a pension renewal, a scholarship letter, a
property tax demand — and answers the four questions a worried person actually
has: what is this, why did I get it, what do I do, and by when. In English,
Hindi and Telugu. It also shrinks files to fit government upload limits, on the
device, because a 6 MB phone photo will not go through a form that caps at
200 KB.

This repository is the production port of the original single-file prototype.

## Running it

You need Node 18+, Python 3.11+, and Docker for PostgreSQL.

```bash
# All services, including the certificate reader
docker compose up --build

# Optional: confirm the collector is ready at http://localhost:8010/health

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
uvicorn app.main:app --reload          # http://localhost:8000/docs

# 3. Frontend, in a second terminal
cd frontend
npm install
cp .env.example .env.local
npm run dev                            # http://localhost:3000
```

### Windows (PowerShell)

PowerShell may block the `npm.ps1` shim, so use `npm.cmd`. You do not need to
activate the virtual environment when invoking its Python executable directly:

First start Docker Desktop and wait until it says it is running. Then run the
following commands, one at a time:

```powershell
docker compose up --build
```

Then open http://localhost:3000. This starts the frontend, backend, database,
collector, and the certificate OCR engine. The backend creates missing tables
on its first startup.

**It runs with no keys at all.** Clerk, Supabase and the AI providers are each
optional. With none configured you get a development user, files recorded but
not persisted, and the rule-based engine answering questions — enough to
develop every screen. Add keys to switch each one on; no code changes.

### Reading uploaded certificates

The upload screen accepts PDF certificates and certificate photos (JPG, PNG,
or another browser-supported image type). The backend saves each upload, reads
text-based PDFs, and uses OCR for scanned PDFs and photos. Docker installs the
required English, Hindi, and Telugu OCR packages. With an AI provider key the extracted text is
also turned into the app's full explanation; without one the extracted text is
still saved and available to the reader and assistant.

For detailed, certificate-specific explanations, create a file named `.env` in
the same folder as `docker-compose.yml` and add your provider key:

```
OPENAI_API_KEY=your_key_here
DEFAULT_AI_PROVIDER=openai
```

Restart with `docker compose up --build`. Without an AI key, the app still
reads certificates and fills the screen with safe certificate-type and
verification guidance, but it cannot reliably infer details that are not
written in the certificate.

The included `sahayak-collector/` service runs on port 8010 and provides the
public-government-service search and crawl API used by the main backend. It
starts with the command above; use its own README before triggering a crawl.
It runs in Docker because its dependencies are contained in a Python 3.11
environment.

## What is where

```
frontend/     Next.js App Router, TypeScript, Tailwind, shadcn/ui
backend/      FastAPI, async SQLAlchemy, Alembic
database/     init.sql and the shared seed data
docs/         Architecture, API reference, setup, component map
```

`docs/COMPONENT_MAP.md` names every file and says what belongs in it.

## Commands

| Command | What it does |
|---|---|
| `make install` | Install both halves |
| `make db-up` | Start PostgreSQL |
| `make migrate` | Autogenerate and apply migrations |
| `make test` | Backend tests plus frontend typecheck |
| `make lint` | ruff and eslint |

## Notes for the team

**The design is not up for redesign.** The palette, the 52px touch targets and
the text-size control were chosen for readers with weak eyesight who are
nervous about touchscreens. Before changing a size or a contrast, read
`docs/ARCHITECTURE.md`.

**Compression stays on the device.** These files are Aadhaar cards and bank
passbooks. Nothing is uploaded to compress it, and the backend never sees the
original.

**The assistant may not invent anything.** It answers from fields extracted
from the reader's own documents. The rule-based engine cannot hallucinate a
deadline because it can only quote one; the prompts for the real providers
forbid it explicitly and tell the reader to confirm at the office named on the
notice. Eligibility answers are hedged on purpose and never state an official
decision.
