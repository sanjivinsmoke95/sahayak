from datetime import date
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.file import File
    from app.models.project import Project
    from app.models.user import User


class Document(Base, UUIDMixin, TimestampMixin):
    """
    An analysed government notice.

    The explained content is stored as JSONB rather than columns because every
    field is trilingual and the shape mirrors what the AI layer returns. One
    document is one row, which keeps reads to a single query.
    """

    __tablename__ = "documents"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    project_id: Mapped[str | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), index=True
    )

    # Stable slug for seeded samples ("pension"), a uuid for real uploads.
    slug: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    # Reference number printed on the notice, e.g. "PDA/RNW/2026/44871".
    ref_no: Mapped[str] = mapped_column(String(120), default="")
    category: Mapped[str] = mapped_column(String(32), index=True, nullable=False, default="other")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="action")
    is_sample: Mapped[bool] = mapped_column(Boolean, default=False)

    received_on: Mapped[date | None] = mapped_column(Date)
    deadline_on: Mapped[date | None] = mapped_column(Date, index=True)
    reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # Trilingual content: {"en": ..., "hi": ..., "te": ...}
    title: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    issuer: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    what: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    why: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    where: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    if_not: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    # The whole notice in one calm paragraph.
    explain: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)

    # The official wording, kept in the language it was printed in: a plain
    # string, not trilingual, because this is what must be quoted at a counter.
    original: Mapped[str] = mapped_column(Text, default="")
    # {"what": str, "why": str, "doIt": str, "where": str}
    gov: Mapped[dict[str, str]] = mapped_column(JSONB, default=dict)
    # Officialese beside what it means: [{"gov": str, "simple": Localized}]
    pairs: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list)

    # Lists of trilingual values.
    steps: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list)
    needs: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list)
    # Index-aligned with `needs`.
    need_done: Mapped[list[bool]] = mapped_column(JSONB, default=list)

    eligibility: Mapped[dict[str, Any] | None] = mapped_column(JSONB)

    # Ticked boxes: {"steps": {"0": true}, "need": {"1": true}}
    checklist: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)

    # OCR output for real uploads, kept for re-analysis with a better model.
    raw_text: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(back_populates="documents")
    project: Mapped["Project | None"] = relationship(back_populates="documents")
    files: Mapped[list["File"]] = relationship(back_populates="document")
