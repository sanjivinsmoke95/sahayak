from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User

# The lifecycle a citizen's application moves through. Statuses the user sets
# themselves are labelled "user" in the history — Sahayak never claims official
# status without a real integration.
APPLICATION_STATUSES = (
    "discovered",
    "preparing",
    "ready",
    "submitted",
    "under_review",
    "additional_information_required",
    "approved",
    "rejected",
    "completed",
)


class Application(Base, UUIDMixin, TimestampMixin):
    """One citizen's journey through a single government service."""

    __tablename__ = "applications"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # References a service id in the catalogue (e.g. "income-certificate").
    service_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(48), nullable=False, default="preparing")
    notes: Mapped[str | None] = mapped_column(Text)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship()
    events: Mapped[list["ApplicationEvent"]] = relationship(
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="ApplicationEvent.created_at",
    )


class ApplicationEvent(Base, UUIDMixin, TimestampMixin):
    """A status change on an application — the timeline, persisted."""

    __tablename__ = "application_events"

    application_id: Mapped[str] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False
    )
    old_status: Mapped[str | None] = mapped_column(String(48))
    new_status: Mapped[str] = mapped_column(String(48), nullable=False)
    # "user" (self-reported) or "system" (created by Sahayak).
    source: Mapped[str] = mapped_column(String(16), nullable=False, default="user")
    note: Mapped[str | None] = mapped_column(Text)

    application: Mapped["Application"] = relationship(back_populates="events")
