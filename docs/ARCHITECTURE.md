# Architecture

## The shape of it

```
Browser (Next.js, App Router)
   |
   |  fetch('/api/...')  ->  rewritten by next.config.mjs
   v
FastAPI
   |-- Clerk         verifies the session JWT against cached JWKS
   |-- PostgreSQL    users, documents, chats, files, settings
   |-- Supabase      the uploaded files themselves
   \-- AI provider   OpenAI | Anthropic | Gemini | OpenRouter | rule-based
```

The browser always calls same-origin `/api`. `next.config.mjs` rewrites that to
`BACKEND_URL`, which means no CORS in development and one origin in production.

## Decisions worth knowing

### Compression runs in the browser, and only in the browser

The files are Aadhaar cards, bank passbooks, disability certificates. Uploading
one in order to shrink it would mean the full-resolution original crosses the
network and lands on a server. It does not: `utils/compression/` resizes and
re-encodes on the device, and only the smaller result is ever uploaded.

The control is the **portal's size limit**, not a quality slider. Nobody knows
what "quality 0.6" means; everybody knows the form said "under 200 KB". The
search steps resolution down a ladder and binary-searches the highest JPEG
quality that fits at each rung, taking the widest rung that still encodes above
`QUALITY_FLOOR` (0.6). Below that, small print smears — and for a document,
legibility is the entire point, so pixels are traded rather than clarity.

Output is JPEG deliberately. WebP and AVIF compress better, but many government
upload forms still reject anything that is not JPG, PNG or PDF.

### The assistant cannot invent facts

Answers come from fields already extracted from the reader's own documents. The
rule-based engine literally cannot hallucinate a deadline — it can only quote
one. The prompts for the hosted providers (`app/services/ai/prompts.py`) forbid
inventing dates, offices, amounts and requirements, and require the reader be
sent to the office named on the notice.

Eligibility is hedged by design: `likely`, `maybe` or `no`, never a decision.
A missing answer produces `maybe` with a reason saying which condition could
not be checked.

### Every provider falls back

`get_provider()` returns the requested engine, or the default, or the
rule-based engine if a key is missing. `/assistant/ask` also catches provider
exceptions and retries against the rule-based engine. A provider outage must
not become a broken screen for someone whose pension has stopped.

### Trilingual content is JSONB, not columns

Every user-facing string exists in three languages. Storing `title_en`,
`title_hi`, `title_te` would triple the column count and make a fourth language
a migration. One `JSONB` column per field holds `{"en": ..., "hi": ..., "te": ...}`,
and a document is one row, so reading one is a single query.

### The API speaks the frontend's field names

`DocumentRead` uses `cat`, `ifNot`, `need`, `refNo` — the names the TypeScript
interface already used. This means no mapping layer in the browser. It costs a
ruff exception (`N815` in `app/schemas/`), which is documented in
`pyproject.toml` and worth it.

### Sample documents have one source

`database/seed/sample_documents.json` and `eligibility_options.json` are read by
the backend at runtime and were generated from the same extraction the frontend
data files came from. The seeded notices and the income bands therefore cannot
drift between the two halves.

### Real routes, not a client-side stack

The prototype kept a navigation stack in memory. Here each screen is a real
App Router route, so back, refresh, deep links and sharing all behave. The
push/pop *feel* is preserved by `ScreenTransition`, which reads a direction
from the UI store to decide which way to slide.

### Optional everything

Clerk, Supabase and the AI keys are all optional, and each degrades to
something usable rather than an error. A new developer clones the repo, runs
two commands and sees a working app. That is deliberate: onboarding friction is
where contributors are lost.

## State

| Concern | Where it lives | Why |
|---|---|---|
| Server data | TanStack Query | Caching, refetching, optimistic updates |
| Preferences | Zustand, persisted | Must survive a reload and be readable before the first request returns |
| Navigation direction, sheets | Zustand, in memory | Pure UI, no value in persisting |
| Chat thread | Zustand, in memory | Survives navigation within a session |
| Ticked checkboxes | Server, optimistic | Must follow the user to another device |

Ticking a checklist box updates the cache before the request lands and rolls
back on failure. On a weak connection, a checkbox that waits for a round trip
feels broken.

## Accessibility

Not decoration, and not optional:

- Body text starts at 16px; the text-size control moves the root to 18 or 20.
- Touch targets are at least 52px, with real words beside every icon.
- Focus rings are 3px and always visible.
- `prefers-reduced-motion` disables the transitions.
- Every language switch also sets `<html lang>`, so screen readers change voice.
