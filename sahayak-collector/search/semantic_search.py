"""
Retrieval layer used by the API and the Sahayak AI.

Exposes three modes over the same filtered candidate set:
  * keyword  — fast SQL ILIKE match (exact-ish, no model needed)
  * semantic — pgvector cosine similarity over sentence embeddings
  * hybrid   — weighted blend of the two (best default for natural questions)

All modes accept state / department / language filters.
"""
from __future__ import annotations

from typing import Optional

from config.settings import settings
from database.connection import session_scope
from database.repository import hybrid_search, keyword_search, semantic_search
from search.embeddings import embed


def _service_to_record(svc) -> dict:
    return {
        "id": svc.id,
        "service_name": svc.service_name,
        "department": svc.department,
        "state": svc.state,
        "district": svc.district,
        "language": svc.language,
        "description": svc.description,
        "eligibility": svc.eligibility or [],
        "required_documents": svc.required_documents or [],
        "application_steps": svc.application_steps or [],
        "fees": svc.fees,
        "processing_time": svc.processing_time,
        "official_application_url": svc.official_application_url,
        "official_notification_url": svc.official_notification_url,
        "forms": svc.forms or [],
        "faq": svc.faq or [],
        "contact": svc.contact or {},
        "version": svc.version,
        "last_updated": svc.last_updated.isoformat() if svc.last_updated else None,
        "source_url": svc.source_url,
    }


def search(
    query: str,
    limit: int = 5,
    mode: Optional[str] = None,
    state: Optional[str] = None,
    department: Optional[str] = None,
    language: Optional[str] = None,
) -> list[dict]:
    """
    Return up to `limit` services ranked by relevance to `query`.

    `mode` is one of keyword | semantic | hybrid (defaults to settings value).
    Each result carries a `score` in [0, 1] (higher = more relevant).
    """
    mode = (mode or settings.default_search_mode).lower()
    with session_scope() as session:
        if mode == "keyword":
            hits = keyword_search(session, query, limit, state, department, language)
        elif mode == "semantic":
            hits = semantic_search(session, embed(query), limit, state, department, language)
        else:  # hybrid
            hits = hybrid_search(
                session,
                query,
                embed(query),
                limit,
                settings.hybrid_semantic_weight,
                state,
                department,
                language,
            )
        results = []
        for svc, score in hits:
            payload = _service_to_record(svc)
            payload["score"] = round(float(score), 4)
            results.append(payload)
    return results
