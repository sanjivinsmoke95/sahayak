# Sahayak Collector — Architecture Review & Upgrade (v2.0)

A complete audit and refactor of the government-data collection system, tuned to
be **clean, resilient and hackathon-ready** — understandable and demoable by a
team of six students.

Sahayak collects **official** Indian government service information and answers
questions like *"What documents do I need? Am I eligible? How do I apply? What's
the fee? How long does it take? Give me the official link."* It **never
hallucinates** — any field missing from the official page is stored as `null`.

---

## 1. What changed and WHY

| Area | Before | After | Why it matters |
|------|--------|-------|----------------|
| **Scrapy API** | `start_requests()` | `async def start()` | `start_requests` is deprecated in Scrapy 2.13; the async seed API is the supported path and avoids deprecation warnings during the demo. |
| **Deprecated setting** | `REQUEST_FINGERPRINTER_IMPLEMENTATION="2.7"` | removed | The old fingerprinter was removed in 2.12+; the setting now only emits noise. |
| **robots.txt** | always obeyed → blocked | configurable, default off | Many gov `robots.txt` files blanket-block bots, halting discovery. We stay polite (throttled, honest UA) but can actually collect public data. |
| **Link discovery** | keyword allow-list only | allow-list **+ ignore-list + priority** | Skips news/tenders/careers/media; spends the crawl budget on real service pages; high-signal links scheduled first. |
| **Resilience** | errback logged only | errback logs **+ counts + continues**, non-HTML skipped | A broken URL, timeout or PDF never stops the crawl. |
| **Observability** | ad-hoc logs | `CrawlStatsLogger` extension | One structured `crawl_start` / `crawl_finish` line with pages, services, duplicates, skips, robots blocks, failures. |
| **Performance** | rendered everything requested | Playwright only when `render:true`, **media/images/fonts blocked**, HTTP cache on | Big memory/bandwidth cut; faster re-runs during a demo. |
| **Schema** | no district/language | `+district`, `+language` (auto-detected) | Enables district and language filters the reviewer asked for. |
| **Database** | overwrite in place | **versioned upsert + `service_versions` history** | Tracks *what changed* and allows rollback if a crawl grabs a bad page. |
| **Search** | semantic only | **keyword / semantic / hybrid** + state/dept/language filters | Hybrid ranks natural questions better and degrades gracefully without the model. |
| **FastAPI** | `@app.on_event` (deprecated), thin models | `lifespan`, typed response models, pagination, filters, `try/except`→503, `/stats`, `/history` | Clean OpenAPI docs, predictable errors, easy to demo. |
| **Config** | fixed | env-driven depth, delay, robots, search mode, weights, port 8010 | Tunable without code edits; no port clash with the app backend. |

---

## 2. Updated folder structure

```
sahayak-collector/
├── config/
│   ├── settings.py          # typed env config: depth, delay, robots, search mode…
│   └── sources.yaml         # portals + trusted domains (add sites w/o code)
├── models/
│   ├── schema.py            # Pydantic ServiceRecord (+district, +language)
│   └── db_models.py         # Service + ServiceVersion (history) + pgvector
├── database/
│   ├── connection.py        # engine, init_db (creates pgvector), session_scope
│   └── repository.py        # versioned upsert + keyword/semantic/hybrid search
├── parser/
│   ├── html_parser.py       # tables, lists, headings, forms, links
│   └── section_detector.py  # heading → schema field (eligibility, docs, steps…)
├── extractor/
│   ├── service_extractor.py # ParsedPage → validated ServiceRecord
│   └── field_extractors.py  # KV scalars, phones/emails, FAQ, language detect
├── crawler/
│   ├── runner.py            # loads sources.yaml, launches spiders
│   ├── playwright_fetcher.py# standalone rendered fetch (debug/tests)
│   └── sahayak_crawl/
│       ├── settings.py      # Scrapy 2.13 settings (no deprecated keys)
│       ├── items.py         # PageItem
│       ├── middlewares.py   # GovernmentDomainMiddleware (gov-only guard)
│       ├── extensions.py    # CrawlStatsLogger (structured summary)
│       ├── pipelines.py     # Extraction → Postgres (with stats counters)
│       └── spiders/
│           ├── base_spider.py     # async start(), smart discovery
│           ├── generic_spider.py  # YAML-driven, most portals
│           └── myscheme_spider.py # myScheme SPA (Playwright)
├── search/
│   ├── embeddings.py        # sentence-transformers (lazy singleton)
│   └── semantic_search.py   # search(mode, filters) facade
├── scheduler/
│   └── jobs.py              # APScheduler daily refresh (separate process)
├── api/
│   ├── main.py             # FastAPI: /search /services /stats /crawl …
│   └── schemas.py          # response models (drive OpenAPI)
├── utils/                  # domain_filter, hashing, logging
├── tests/                  # offline: extraction, discovery, language
├── cli.py                  # init-db | crawl | search | schedule
├── docker-compose.yml + Dockerfile + requirements.txt
└── README.md / ARCHITECTURE.md
```

---

## 3. Architecture diagram

```
                         ┌──────────────────────────────────────────┐
                         │              config/sources.yaml          │
                         │   portals + trusted .gov.in/.nic.in list  │
                         └───────────────────┬──────────────────────┘
                                             │ drives
                    ┌────────────────────────▼─────────────────────────┐
                    │                    CRAWLER (Scrapy 2.13)          │
                    │  async start() → seeds official homepages         │
                    │  GovernmentDomainMiddleware  (gov-only hard guard) │
                    │  smart discovery: allow-list + ignore-list + prio  │
                    │  Playwright ONLY when render:true (media blocked)  │
                    │  CrawlStatsLogger → structured crawl summary       │
                    └───────────────┬────────────────────┬──────────────┘
                                    │ PageItem(html)      │ stats
                    ┌───────────────▼──────────────┐      │
                    │  ExtractionPipeline           │      │
                    │  HtmlParser → SectionDetector │      │
                    │  → ServiceExtractor (Pydantic)│      │
                    │  + embedding (MiniLM)         │      │
                    └───────────────┬──────────────┘      │
                                    │ ServiceRecord         │
                    ┌───────────────▼──────────────┐        │
                    │  PostgresPipeline             │────────┘
                    │  versioned upsert by source_url│
                    └───────────────┬──────────────┘
                                    │
                 ┌──────────────────▼───────────────────┐
                 │            PostgreSQL + pgvector       │
                 │  services (current) │ service_versions │
                 └──────────────────┬───────────────────┘
                                    │ keyword / semantic / hybrid
        ┌───────────────────────────▼────────────────────────┐
        │                    FastAPI (:8010)                   │
        │  /search  /services  /services/{id}/history  /stats  │
        └───────────────────────────┬────────────────────────┘
                                     │ HTTP (proxied by app backend :8000)
                              Sahayak AI / Frontend
        ┌────────────────────────────────────────────────────┐
        │  scheduler/jobs.py  → APScheduler → re-crawl daily   │
        └────────────────────────────────────────────────────┘
```

---

## 4. Data flow

1. **Seed** — `async start()` yields the source's official homepage URLs (gov-only).
2. **Discover** — each page's links are filtered: must be gov domain, same registrable
   domain, match a **service keyword**, and NOT match an **ignore keyword**
   (news/tenders/careers/media; non-form PDFs). High-signal links get higher priority.
3. **Fetch** — plain HTTP by default; Playwright renders only sources marked
   `render: true`, with images/media/fonts aborted to save memory.
4. **Extract** — `HtmlParser` pulls tables/lists/headings/forms; `SectionDetector`
   maps headings to fields; `ServiceExtractor` builds a **validated `ServiceRecord`**.
   Missing fields stay `null`. District and language are derived.
5. **Embed** — the service's key text is embedded (MiniLM, 384-dim).
6. **Store** — `upsert_service` keys on `source_url`. Unchanged content = no-op.
   Changed content = snapshot old row into `service_versions`, bump `version`, overwrite.
7. **Search** — API embeds the user's question and runs keyword/semantic/hybrid with
   optional state/department/language filters; returns ranked services with scores.
8. **Refresh** — APScheduler re-runs the crawl daily in a fresh process.

---

## 5. Setup guide (local, ~5 minutes)

```bash
cd sahayak-collector
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium          # only needed for render:true sources

cp .env.example .env                            # set POSTGRES_PASSWORD
docker compose up -d db                         # Postgres + pgvector (or use your own)
python cli.py init-db                           # create tables + pgvector extension

python cli.py crawl edistrict_up myscheme       # crawl a couple of sources
python cli.py search "I need an income certificate" --mode hybrid
uvicorn api.main:app --port 8010 --reload       # API + docs at :8010/docs
```

## 6. Deployment guide

```bash
cp .env.example .env      # set a real POSTGRES_PASSWORD
docker compose up -d      # db + api(:8010) + scheduler
docker compose logs -f scheduler   # watch periodic refreshes
```

- The collector runs on **:8010**; the main Sahayak app backend runs on **:8000** and
  proxies to it via `COLLECTOR_API_URL` (already wired in `sahayak-fullstack`).
- Scale reads by running multiple `api` replicas behind a load balancer (stateless).
- The crawl is a batch job — run it via the scheduler container or a cron/CI job.

## 7. Testing guide

```bash
pytest -q                 # offline: extraction, discovery, language (no DB/network)
python cli.py crawl edistrict_up   # smoke-test one real source
curl "http://localhost:8010/search?q=income%20certificate&mode=hybrid&limit=3"
curl "http://localhost:8010/stats"
```

- **Unit** (`tests/`): parsing/extraction, ignore-vs-follow link rules, language detection.
- **Integration**: run one source, then hit `/services` and `/services/{id}/history`.
- **Add tests** by dropping a saved gov HTML file into a test and asserting the record.

---

## 8. Known limitations

- **Portal-specific structure**: `sources.yaml` start URLs are representative; deep
  state portals (Seva Sindhu, MeeSeva) may need their real service-listing URLs and
  sometimes a bespoke spider. The generic extractor is heuristic, not perfect.
- **robots.txt default off**: acceptable for a low-volume hackathon on public data, but
  **review each portal's terms** before scaling. Flip `RESPECT_ROBOTS_TXT=true` for strict mode.
- **Language detection** is script-based (Hindi/Telugu/English); it won't distinguish
  languages that share the Devanagari script.
- **FAQ extraction** is best-effort (Q/A pairing by punctuation/structure).
- **Embeddings** (MiniLM) are general-purpose; domain fine-tuning would improve ranking.
- **No auth / rate-limiting** on the collector API — it's meant to sit behind the app backend.
- **CAPTCHA / login-gated pages** are out of scope.

## 9. Suggested future improvements

- **pgvector HNSW index** on `services.embedding` for sub-linear semantic search at scale.
- **Full-text search** (`tsvector` + GIN) to make keyword search rank instead of flag.
- **LLM-assisted extraction fallback** (structured-output) for messy pages — still grounded, `null` when unseen.
- **Per-source spiders** for the top 5 state portals; **sitemap.xml** seeding where available.
- **Change alerts**: notify when a fee/eligibility/document list changes (diff `service_versions`).
- **Incremental crawls** using `Last-Modified`/`ETag` to skip unchanged pages cheaply.
- **Observability**: export crawl stats to Prometheus; a small dashboard of coverage by state.
- **Data quality**: confidence score per field; flag low-confidence records for human review.

---

## Roadmap (phased)

- **Phase 1 (now)** — resilient crawler, versioned store, hybrid search, clean API. ✅
- **Phase 2** — HNSW + full-text indexes, per-source spiders for top states, change alerts.
- **Phase 3** — LLM-assisted extraction fallback, confidence scoring, human-review queue.
- **Phase 4** — coverage dashboard, Prometheus metrics, multi-region deploy, incremental crawls.
