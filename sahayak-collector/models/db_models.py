"""
SQLAlchemy ORM models.

`services`         : current state — one row per unique government service.
`service_versions` : append-only history — a snapshot each time a service's
                     official content changes, so we can show "what changed" and
                     roll back if a crawl ever captures a bad page.

Change-detection uses `content_hash`; `version` increments on every real change.
A pgvector column on `services` powers semantic search.
"""
from __future__ import annotations

from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from config.settings import settings


class Base(DeclarativeBase):
    pass


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Service(Base):
    """A single government service / scheme (current version)."""

    __tablename__ = "services"
    __table_args__ = (
        UniqueConstraint("source_url", name="uq_services_source_url"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # ---- Application-facing fields ----
    service_name: Mapped[str] = mapped_column(String(512), index=True)
    department: Mapped[str | None] = mapped_column(String(512), index=True, nullable=True)
    state: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    district: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    language: Mapped[str] = mapped_column(String(8), default="en", index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    fees: Mapped[str | None] = mapped_column(Text, nullable=True)
    processing_time: Mapped[str | None] = mapped_column(String(256), nullable=True)
    official_application_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    official_notification_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    eligibility: Mapped[list] = mapped_column(JSON, default=list)
    required_documents: Mapped[list] = mapped_column(JSON, default=list)
    application_steps: Mapped[list] = mapped_column(JSON, default=list)
    forms: Mapped[list] = mapped_column(JSON, default=list)
    faq: Mapped[list] = mapped_column(JSON, default=list)
    contact: Mapped[dict] = mapped_column(JSON, default=dict)

    # ---- Provenance / bookkeeping ----
    source_url: Mapped[str] = mapped_column(Text, index=True)
    source_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    content_hash: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)

    # ---- Semantic search vector ----
    embedding: Mapped[list | None] = mapped_column(
        Vector(settings.embedding_dim), nullable=True
    )

    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    history: Mapped[list["ServiceVersion"]] = relationship(
        back_populates="service", cascade="all, delete-orphan", order_by="ServiceVersion.version"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Service {self.id} {self.service_name!r} v{self.version} state={self.state!r}>"


class ServiceVersion(Base):
    """Immutable snapshot of a service at a point in time (audit / rollback)."""

    __tablename__ = "service_versions"
    __table_args__ = (
        UniqueConstraint("service_id", "version", name="uq_service_version"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )
    version: Mapped[int] = mapped_column(Integer)
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    snapshot: Mapped[dict] = mapped_column(JSON)   # full app payload at this version
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    service: Mapped["Service"] = relationship(back_populates="history")
