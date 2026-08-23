"""
Repository layer: the ONLY place that reads/writes the services tables.

Responsibilities:
  * Upsert by `source_url` (natural key) -> no duplicate rows.
  * Skip writes when page content is unchanged (`content_hash` match) so
    `last_updated` only moves when the official page actually changes.
  * On change: snapshot the PREVIOUS version into `service_versions`, then bump
    `version` and overwrite the current row (history preserved).
  * Provide keyword, semantic and hybrid search with state/department/language
    filters for the search layer.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from models.db_models import Service, ServiceVersion
from models.schema import ServiceRecord

_APP_FIELDS = (
    "service_name", "department", "state", "district", "language", "description",
    "eligibility", "required_documents", "application_steps", "fees",
    "processing_time", "official_application_url", "official_notification_url",
    "forms", "faq", "contact",
)


class UpsertResult:
    """Describes what an upsert did, plus the resulting version."""

    INSERTED = "inserted"
    UPDATED = "updated"
    UNCHANGED = "unchanged"

    def __init__(self, action: str, service_id: Optional[int], version: int):
        self.action = action
        self.service_id = service_id
        self.version = version

    def __repr__(self) -> str:  # pragma: no cover
        return f"<UpsertResult {self.action} id={self.service_id} v{self.version}>"


def _record_to_columns(record: ServiceRecord) -> dict:
    payload = record.model_dump(mode="json")
    values = {f: payload[f] for f in _APP_FIELDS}
    values["source_url"] = record.source_url
    values["source_name"] = record.source_name
    values["content_hash"] = record.content_hash
    return values


def get_by_source_url(session: Session, source_url: str) -> Optional[Service]:
    return session.scalars(
        select(Service).where(Service.source_url == source_url)
    ).first()


def _snapshot(service: Service) -> None:
    """Append the service's current state to its version history."""
    session = Session.object_session(service)
    snap = {f: getattr(service, f) for f in _APP_FIELDS}
    session.add(
        ServiceVersion(
            service_id=service.id,
            version=service.version,
            content_hash=service.content_hash,
            snapshot=snap,
        )
    )


def upsert_service(
    session: Session,
    record: ServiceRecord,
    embedding: Optional[list[float]] = None,
) -> UpsertResult:
    """Insert or update a service keyed on `source_url`, keeping version history."""
    if not record.source_url:
        raise ValueError("record.source_url is required for upsert")

    existing = get_by_source_url(session, record.source_url)
    values = _record_to_columns(record)

    if existing is None:
        service = Service(version=1, **values)
        if embedding is not None:
            service.embedding = embedding
        session.add(service)
        session.flush()
        return UpsertResult(UpsertResult.INSERTED, service.id, 1)

    # Unchanged content -> no-op (a "duplicate" revisit).
    if existing.content_hash and existing.content_hash == record.content_hash:
        return UpsertResult(UpsertResult.UNCHANGED, existing.id, existing.version)

    # Changed -> archive the old version, then overwrite + bump version.
    _snapshot(existing)
    for key, val in values.items():
        setattr(existing, key, val)
    existing.version += 1
    if embedding is not None:
        existing.embedding = embedding
    session.flush()
    return UpsertResult(UpsertResult.UPDATED, existing.id, existing.version)


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------
def _apply_filters(stmt, state, department, language):
    if state:
        stmt = stmt.where(Service.state == state)
    if department:
        stmt = stmt.where(Service.department.ilike(f"%{department}%"))
    if language:
        stmt = stmt.where(Service.language == language)
    return stmt


def keyword_search(
    session: Session,
    query: str,
    limit: int = 5,
    state: Optional[str] = None,
    department: Optional[str] = None,
    language: Optional[str] = None,
) -> list[tuple[Service, float]]:
    """Case-insensitive match on name/description/department. Score = 1.0 flag."""
    like = f"%{query}%"
    stmt = select(Service).where(
        or_(
            Service.service_name.ilike(like),
            Service.description.ilike(like),
            Service.department.ilike(like),
        )
    )
    stmt = _apply_filters(stmt, state, department, language)
    # Prefer name matches first.
    stmt = stmt.order_by(Service.service_name.ilike(like).desc()).limit(limit)
    return [(svc, 1.0) for svc in session.scalars(stmt).all()]


def semantic_search(
    session: Session,
    query_embedding: list[float],
    limit: int = 5,
    state: Optional[str] = None,
    department: Optional[str] = None,
    language: Optional[str] = None,
) -> list[tuple[Service, float]]:
    """Vector similarity (pgvector cosine). Returns (service, similarity in 0..1)."""
    distance = Service.embedding.cosine_distance(query_embedding).label("distance")
    stmt = select(Service, distance).where(Service.embedding.isnot(None))
    stmt = _apply_filters(stmt, state, department, language)
    stmt = stmt.order_by(distance).limit(limit)
    return [(row[0], 1.0 - float(row[1])) for row in session.execute(stmt).all()]


def hybrid_search(
    session: Session,
    query: str,
    query_embedding: list[float],
    limit: int = 5,
    semantic_weight: float = 0.6,
    state: Optional[str] = None,
    department: Optional[str] = None,
    language: Optional[str] = None,
) -> list[tuple[Service, float]]:
    """
    Blend semantic and keyword results.

    Each service's final score = w * semantic_similarity + (1 - w) * keyword_hit.
    Pulling a wider candidate pool (3x) before re-ranking improves recall.
    """
    pool = max(limit * 3, 10)
    sem = semantic_search(session, query_embedding, pool, state, department, language)
    kw = keyword_search(session, query, pool, state, department, language)

    scores: dict[int, float] = {}
    services: dict[int, Service] = {}
    for svc, sim in sem:
        services[svc.id] = svc
        scores[svc.id] = semantic_weight * sim
    for svc, _ in kw:
        services[svc.id] = svc
        scores[svc.id] = scores.get(svc.id, 0.0) + (1 - semantic_weight) * 1.0

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:limit]
    return [(services[sid], round(score, 4)) for sid, score in ranked]


def get_history(session: Session, service_id: int) -> list[ServiceVersion]:
    return list(
        session.scalars(
            select(ServiceVersion)
            .where(ServiceVersion.service_id == service_id)
            .order_by(ServiceVersion.version)
        ).all()
    )
