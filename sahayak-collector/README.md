# Sahayak — Government Data Collection System

An automated system that crawls **official Indian Government websites**, extracts
structured information about citizen services and schemes, stores it in
**PostgreSQL**, and exposes a **semantic search API** so an AI assistant can
answer questions like *"I need an income certificate."*

> **Guarantee:** the crawler only ever fetches official government domains
> (`.gov.in`, `.nic.in`, and an explicit allow-list of recognised portals), and
> the extractor never fabricates data — any field absent from the official page
> is stored as `null` / empty.

---

## What it does

- **Discovers** services such as Income / Caste / Birth / Death Certificate,
  Passport, Driving Licence, Pension, PM Kisan, Ayushman Bharat, Scholarships and
  general Government Schemes.
- **Crawls** myScheme, data.gov.in, National Portal of India, State eDistrict
  portals, MeeSeva, Seva Sindhu, Passport Seva, Parivahan, UIDAI, Income Tax and
  more — all configured in `config/sources.yaml` (add portals without code).
- **Extracts** every page into a fixed JSON schema by detecting tables, lists,
  headings, forms, and Eligibility / Documents / Application sections.
- **Stores** everything in PostgreSQL with deduplication, change-detection and
  `last_updated` timestamps.
- **Searches** semantically using sentence-transformer embeddings + pgvector.
- **Refreshes** automatically on a schedule (APScheduler).

## Output schema

Every page becomes one record:

```json
{
  "service_name": "",
  "department": "",
  "state": "",
  "description": "",
  "eligibility": [],
  "required_documents": [],
  "application_steps": [],
  "fees": "",
  "processing_time": "",
  "official_application_url": "",
  "official_notification_url": "",
  "forms": [],
  "faq": [],
  "contact": {}
}
```

## Project structure

```
sahayak-collector/
├── config/          # settings + sources.yaml (all portals + trusted domains)
├── models/          # schema.py (Pydantic) + db_models.py (SQLAlchemy + pgvector)
├── database/        # connection.py + repository.py (upsert / dedup / search)
├── parser/          # html_parser.py (tables/lists/forms) + section_detector.py
├── extractor/       # service_extractor.py -> validated ServiceRecord
├── crawler/         # Scrapy project + Playwright fetcher + runner
│   └── sahayak_crawl/ (settings, items, middlewares, pipelines, spiders/)
├── search/          # embeddings.py + semantic_search.py
├── scheduler/       # jobs.py (APScheduler periodic refresh)
├── api/             # main.py (FastAPI: /search, /services, /crawl)
├── utils/           # domain_filter, hashing, logging
├── tests/           # pytest (offline extraction tests)
├── cli.py           # unified command-line entrypoint
├── docker-compose.yml + Dockerfile
└── requirements.txt
```

## Data flow

```
sources.yaml -> Scrapy spider (Playwright for JS pages) -> PageItem(html)
   -> ExtractionPipeline (HtmlParser -> ServiceExtractor -> ServiceRecord + embedding)
   -> PostgresPipeline (upsert by source_url, skip if content_hash unchanged)
   -> /search embeds the user question and returns ranked services
```

## Quick start (Docker)

```bash
cp .env.example .env          # set POSTGRES_PASSWORD etc.
docker compose up -d db       # Postgres with pgvector
docker compose up api scheduler
# API now on http://localhost:8000/docs
```

## Quick start (local)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium

cp .env.example .env          # point at your Postgres
python cli.py init-db         # create tables + pgvector extension

python cli.py crawl myscheme edistrict_up   # crawl specific sources
python cli.py crawl                          # crawl everything

python cli.py search "I need an income certificate"

uvicorn api.main:app --reload                # start the API
python -m scheduler.jobs                      # start periodic refresh
```

## API

| Method | Path                | Purpose                                             |
|--------|---------------------|-----------------------------------------------------|
| GET    | `/health`           | Liveness probe                                      |
| GET    | `/services`         | Browse services (filter by `state`, `department`)   |
| GET    | `/services/{id}`    | Fetch one service                                   |
| GET    | `/search?q=...`     | **Semantic search — the AI retrieval endpoint**     |
| POST   | `/crawl`            | Trigger a crawl (all or named `sources`)            |

Example:

```bash
curl "http://localhost:8000/search?q=I%20need%20an%20income%20certificate&limit=3"
```

returns the matching services with eligibility, required documents, fees and the
official application link.

## Error handling

- **404 / dead links** — dropped and logged via the spider `errback`.
- **Rate limits (429) / 5xx** — retried with backoff; AutoThrottle adapts the
  request rate per domain.
- **Timeouts / network / DNS failures** — caught by the `errback`, logged, crawl
  continues.
- **Website structure changes** — rule-based section detection degrades
  gracefully; unmapped sections are skipped rather than mis-stored, and missing
  fields stay `null`.
- **Duplicate pages** — natural key is `source_url`; unchanged content
  (`content_hash` match) is a no-op so `last_updated` only moves on real changes.

## Configuration

All runtime config is environment-driven (`.env`, see `.env.example`) and typed
in `config/settings.py`. Add or edit crawl targets in `config/sources.yaml` —
set `render: true` for JavaScript single-page apps (routed through Playwright).

## Testing

```bash
pytest -q          # offline extraction tests (no DB/network needed)
```

## Ethics & compliance

The system respects `robots.txt` by default, identifies itself with a
descriptive User-Agent, throttles requests, and restricts itself to official
government domains. Only factual, on-page content is stored; nothing is inferred
or invented. Review each portal's terms of use before large-scale crawling.
