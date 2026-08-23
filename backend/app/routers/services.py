"""
Government services router — the main backend's SINGLE proxy over the standalone
Sahayak Data Collector.

This is the only place the app talks to the collector. The browser calls the
main backend at `/api/services/*` (same-origin via the Next.js rewrite); this
router forwards to the collector (`COLLECTOR_API_URL`, default :8010) and returns
the collector's responses unchanged. The collector owns crawling, extraction,
PostgreSQL and the semantic index — we never touch its DB directly.

    Browser → /api/services/*  →  main backend (this file)  →  collector  →  Postgres

Endpoints (all under the main API prefix, e.g. `/api/services`):
    GET  /services                 list (paginated, filterable)
    GET  /services/search          keyword | semantic | hybrid search
    GET  /services/stats           aggregate statistics
    GET  /services/health          collector reachability (200 up / 503 down)
    GET  /services/{id}            one service
    GET  /services/{id}/history    version history
    POST /services/crawl           trigger a crawl
    POST /services/chat            grounded answer built from collector search
"""

import logging

import httpx
from fastapi import APIRouter, HTTPException, Query, status

from app.config import settings
from app.schemas import (
    GovChatCitation,
    GovChatRequest,
    GovChatResponse,
    GovService,
    GovServiceHit,
    GovServiceSearchResponse,
    GovServiceVersion,
    GovStats,
    PaginatedServices,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/services", tags=["services"])


def _base() -> str:
    if not settings.collector_enabled:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Government data collector is not configured (set COLLECTOR_API_URL).",
        )
    return settings.collector_api_url.rstrip("/")


async def _request(method: str, path: str, *, params: dict | None = None, json=None) -> dict:
    """Forward a request to the collector, mapping failures to clean HTTP errors."""
    base = _base()
    try:
        async with httpx.AsyncClient(timeout=settings.collector_timeout) as client:
            resp = await client.request(method, f"{base}{path}", params=params, json=json)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as exc:
        logger.warning("Collector %s %s -> %s", method, path, exc.response.status_code)
        raise HTTPException(exc.response.status_code, "Collector request failed") from exc
    except httpx.HTTPError as exc:
        logger.warning("Collector unreachable (%s %s): %s", method, path, exc)
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "Government data collector is unreachable"
        ) from exc


# ---------------------------------------------------------------------------
# Health — 200 when the collector is reachable, 503 when it is not, so the
# frontend's health hook (and offline banner) reflect the data service state.
# ---------------------------------------------------------------------------
@router.get("/health")
async def collector_health() -> dict:
    if not settings.collector_enabled:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "collector not configured")
    base = _base()
    try:
        async with httpx.AsyncClient(timeout=settings.collector_timeout) as client:
            resp = await client.get(f"{base}/health")
            resp.raise_for_status()
            payload = resp.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "collector unreachable") from exc
    return {"status": "ok", "collector": payload}


# ---------------------------------------------------------------------------
# Search / list / detail / history / stats
# ---------------------------------------------------------------------------
@router.get("/search", response_model=GovServiceSearchResponse)
async def search_services(
    q: str = Query(..., min_length=2, description="Natural-language question"),
    mode: str | None = Query(None, description="keyword | semantic | hybrid"),
    limit: int = Query(5, ge=1, le=25),
    state: str | None = None,
    department: str | None = None,
    language: str | None = None,
) -> GovServiceSearchResponse:
    params: dict = {"q": q, "limit": limit}
    for k, v in (
        ("mode", mode),
        ("state", state),
        ("department", department),
        ("language", language),
    ):
        if v:
            params[k] = v
    data = await _request("GET", "/search", params=params)
    return GovServiceSearchResponse(**data)


@router.get("/stats", response_model=GovStats)
async def stats() -> GovStats:
    return GovStats(**await _request("GET", "/stats"))


@router.get("", response_model=PaginatedServices)
async def list_services(
    state: str | None = None,
    department: str | None = None,
    language: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> PaginatedServices:
    params: dict = {"limit": limit, "offset": offset}
    for k, v in (("state", state), ("department", department), ("language", language)):
        if v:
            params[k] = v
    return PaginatedServices(**await _request("GET", "/services", params=params))


@router.get("/{service_id}", response_model=GovService)
async def get_service(service_id: int) -> GovService:
    return GovService(**await _request("GET", f"/services/{service_id}"))


@router.get("/{service_id}/history", response_model=list[GovServiceVersion])
async def service_history(service_id: int) -> list[GovServiceVersion]:
    data = await _request("GET", f"/services/{service_id}/history")
    return [GovServiceVersion(**v) for v in data]


# ---------------------------------------------------------------------------
# Crawl trigger + grounded chat (both reuse the collector; nothing invented)
# ---------------------------------------------------------------------------
@router.post("/crawl", status_code=status.HTTP_202_ACCEPTED)
async def trigger_crawl(sources: list[str] | None = None) -> dict:
    return await _request("POST", "/crawl", json=sources)


_NOT_FOUND = "I couldn't find this information in the official Government database."


@router.post("/chat", response_model=GovChatResponse)
async def chat(payload: GovChatRequest) -> GovChatResponse:
    """
    Grounded answer over official data: retrieve via the collector's hybrid
    search, then answer ONLY from the retrieved records (no hallucination). If
    nothing relevant is found, return the fixed message.
    """
    params = {"q": payload.question, "mode": "hybrid", "limit": payload.top_k}
    if payload.state:
        params["state"] = payload.state
    data = await _request("GET", "/search", params=params)
    hits = [GovServiceHit(**h) for h in data.get("results", [])]

    if not hits or (hits[0].score or 0) < 0.25:
        return GovChatResponse(answer=_NOT_FOUND, grounded=False)

    top = hits[0]
    lines = [f"Based on the official information for '{top.service_name}':"]
    if top.description:
        lines.append(top.description)
    if top.required_documents:
        lines.append("Required documents: " + "; ".join(top.required_documents))
    if top.eligibility:
        lines.append("Eligibility: " + "; ".join(top.eligibility))
    if top.application_steps:
        lines.append("How to apply: " + "; ".join(top.application_steps))
    if top.fees:
        lines.append(f"Fees: {top.fees}")
    if top.processing_time:
        lines.append(f"Processing time: {top.processing_time}")
    if top.official_application_url:
        lines.append(f"Official link: {top.official_application_url}")

    citations = [
        GovChatCitation(
            service_name=h.service_name,
            source_url=h.source_url,
            official_application_url=h.official_application_url,
        )
        for h in hits
    ]
    return GovChatResponse(
        answer="\n".join(lines),
        grounded=True,
        citations=citations,
        used_services=hits,
    )
