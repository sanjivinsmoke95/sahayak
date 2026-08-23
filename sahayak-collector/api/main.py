"""
FastAPI application exposing the Sahayak knowledge base.

Endpoints (all documented in OpenAPI at /docs):
  GET  /health                 - liveness + integration status
  GET  /search                 - keyword | semantic | hybrid search (AI endpoint)
  GET  /services               - paginated browse with filters
  GET  /services/{id}          - one service
  GET  /services/{id}/history  - version history
  GET  /stats                  - counts by state / language
  POST /crawl                  - trigger a crawl (background)
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from sqlalchemy import func, select

from config.settings import PROJECT_ROOT, settings
from database.connection import init_db, session_scope
from database.repository import get_history
from models.db_models import Service
from search.semantic_search import _service_to_record, search
from api.schemas import (
    CrawlAccepted,
    PaginatedServices,
    SearchResponse,
    ServiceOut,
    StatsResponse,
    VersionOut,
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Ensure schema + pgvector exist so the API works on a fresh database.
    init_db()
    yield


app = FastAPI(
    title="Sahayak Government Data API",
    description="Structured, searchable knowledge base of official Indian government services.",
    version="2.0.0",
    lifespan=lifespan,
)


@app.get("/health", tags=["ops"])
async def health() -> dict:
    return {
        "status": "ok",
        "search_mode": settings.default_search_mode,
        "embedding_model": settings.embedding_model,
    }


@app.get("/search", response_model=SearchResponse, tags=["search"])
async def search_endpoint(
    q: str = Query(..., min_length=2, description="Natural-language question"),
    mode: Literal["keyword", "semantic", "hybrid"] | None = Query(
        None, description="Defaults to the server's configured mode"
    ),
    limit: int = Query(5, ge=1, le=25),
    state: Optional[str] = None,
    department: Optional[str] = None,
    language: Optional[str] = Query(None, description="en | hi | te"),
):
    """Retrieve services relevant to a question. The AI's grounding endpoint."""
    try:
        results = search(q, limit=limit, mode=mode, state=state,
                         department=department, language=language)
    except Exception as exc:  # DB / embedding outage -> clear 503
        raise HTTPException(503, f"search backend unavailable: {exc}") from exc
    used = (mode or settings.default_search_mode).lower()
    return {"query": q, "mode": used, "count": len(results), "results": results}


@app.get("/services", response_model=PaginatedServices, tags=["services"])
async def list_services(
    state: Optional[str] = None,
    department: Optional[str] = None,
    language: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Browse stored services with filters and pagination."""
    with session_scope() as session:
        base = select(Service)
        if state:
            base = base.where(Service.state == state)
        if department:
            base = base.where(Service.department.ilike(f"%{department}%"))
        if language:
            base = base.where(Service.language == language)
        total = session.scalar(select(func.count()).select_from(base.subquery()))
        rows = session.scalars(
            base.order_by(Service.service_name).limit(limit).offset(offset)
        ).all()
        return {
            "total": int(total or 0),
            "limit": limit,
            "offset": offset,
            "results": [_service_to_record(r) for r in rows],
        }


@app.get("/services/{service_id}", response_model=ServiceOut, tags=["services"])
async def get_service(service_id: int):
    with session_scope() as session:
        svc = session.get(Service, service_id)
        if svc is None:
            raise HTTPException(404, "Service not found")
        return _service_to_record(svc)


@app.get("/services/{service_id}/history", response_model=list[VersionOut], tags=["services"])
async def service_history(service_id: int):
    """Full change history for a service (audit / 'what changed')."""
    with session_scope() as session:
        if session.get(Service, service_id) is None:
            raise HTTPException(404, "Service not found")
        return [
            {
                "version": v.version,
                "content_hash": v.content_hash,
                "captured_at": v.captured_at.isoformat() if v.captured_at else None,
                "snapshot": v.snapshot,
            }
            for v in get_history(session, service_id)
        ]


@app.get("/stats", response_model=StatsResponse, tags=["ops"])
async def stats():
    with session_scope() as session:
        total = session.scalar(select(func.count()).select_from(Service)) or 0
        by_state = dict(
            session.execute(
                select(Service.state, func.count()).group_by(Service.state)
            ).all()
        )
        by_lang = dict(
            session.execute(
                select(Service.language, func.count()).group_by(Service.language)
            ).all()
        )
        return {
            "total_services": int(total),
            "by_state": {k or "unknown": v for k, v in by_state.items()},
            "by_language": {k or "unknown": v for k, v in by_lang.items()},
        }


@app.post("/crawl", response_model=CrawlAccepted, status_code=202, tags=["ops"])
async def trigger_crawl(sources: Optional[list[str]] = None):
    """
    Trigger a crawl. Runs in a separate process because Scrapy's Twisted reactor
    cannot be restarted inside a live web-server process.
    """
    import subprocess
    import sys

    cmd = [sys.executable, "-m", "crawler.runner", *(sources or [])]
    subprocess.Popen(cmd, cwd=str(PROJECT_ROOT))
    return {"status": "crawl_started", "sources": sources or "all"}
