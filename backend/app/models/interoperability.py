"""
Government interoperability (SIH26129).

A citizen changes one field — address or phone — once in Sahayak, consents to
sharing it, and the change is propagated to several independent government
systems through a common connector layer. These models hold everything that
propagation needs and everything it leaves behind as an audit trail.

Kept deliberately separate from the rest of the schema so the feature is easy
to reason about and easy to remove: nothing here alters an existing table.
"""

from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User

# The systems Sahayak can propagate an authorised update to. Declared once here
# so the connectors, the mock endpoints and validation all agree on the set.
GOV_SYSTEMS: tuple[str, ...] = ("aadhaar", "pan", "rto", "passport", "voter")
# Human labels for history/audit rendering.
GOV_SYSTEM_LABELS: dict[str, str] = {
    "aadhaar": "Aadhaar",
    "pan": "PAN",
    "rto": "Driving Licence (RTO)",
    "passport": "Passport",
    "voter": "Voter ID",
}
SYNC_FIELDS: tuple[str, ...] = ("address", "phone")


class CitizenProfile(Base, UUIDMixin, TimestampMixin):
    """The citizen's own canonical government profile — exactly one per user.

    This is the single source of truth a change is written against before it is
    propagated outward. It is distinct from `Profile`, which models *other*
    people a user helps with paperwork; this row is the user themselves.

    Address is stored as the canonical dict {line1, city, state, pincode} so the
    same shape flows unchanged through the connectors into every mock system.
    """

    __tablename__ = "citizen_profiles"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    # Display-only identity fields, shown on the unified profile. Not synced.
    full_name: Mapped[str] = mapped_column(String(120), default="")
    dob: Mapped[str] = mapped_column(String(10), default="")  # ISO date string

    # Canonical, syncable fields.
    address: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    phone: Mapped[str] = mapped_column(String(20), default="")

    user: Mapped["User"] = relationship()


class SyncConsent(Base, UUIDMixin, TimestampMixin):
    """A citizen's recorded authorisation to share one field with named systems.

    Persisted for every attempt — including denials — so the audit trail can
    always answer "was this sharing consented to, and to which systems?".
    """

    __tablename__ = "sync_consents"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    field: Mapped[str] = mapped_column(String(16), nullable=False)  # "address" | "phone"
    targets: Mapped[list[str]] = mapped_column(JSONB, default=list)  # ["aadhaar", ...]
    purpose: Mapped[str] = mapped_column(String(120), default="cross_system_update")
    status: Mapped[str] = mapped_column(String(16), default="granted")  # "granted" | "denied"


class SyncBatch(Base, UUIDMixin, TimestampMixin):
    """One propagation of one field change across one or more systems.

    Together with its `results` this is the synchronization record *and* the
    audit trail: who changed what, from which value to which, under which
    consent, and how each system responded. Sensitive values (phone) are stored
    here in masked form only — the real value lives in `CitizenProfile`.
    """

    __tablename__ = "sync_batches"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    consent_id: Mapped[str | None] = mapped_column(
        ForeignKey("sync_consents.id", ondelete="SET NULL")
    )
    field: Mapped[str] = mapped_column(String(16), nullable=False)
    # Canonical values, masked where the field is sensitive. address -> dict,
    # phone -> masked string.
    old_value: Mapped[Any | None] = mapped_column(JSONB)
    new_value: Mapped[Any | None] = mapped_column(JSONB)
    # "pending" | "success" | "partial" | "failed" | "denied"
    status: Mapped[str] = mapped_column(String(16), default="pending")

    results: Mapped[list["SyncResult"]] = relationship(
        back_populates="batch",
        cascade="all, delete-orphan",
        order_by="SyncResult.system",
    )


class SyncResult(Base, UUIDMixin, TimestampMixin):
    """Per-system outcome within a batch. A retry updates this row in place."""

    __tablename__ = "sync_results"

    batch_id: Mapped[str] = mapped_column(
        ForeignKey("sync_batches.id", ondelete="CASCADE"), index=True, nullable=False
    )
    system: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="pending")  # success|failed|pending
    error: Mapped[str | None] = mapped_column(String(200))
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    batch: Mapped["SyncBatch"] = relationship(back_populates="results")


class MockGovRecord(Base, UUIDMixin, TimestampMixin):
    """An independent government system's own copy of a citizen's contact data.

    Five rows exist per citizen, one per system. They are deliberately separate
    storage from `CitizenProfile`: the whole point of the demonstration is that
    these are *different* systems whose data only converges through the
    interoperability layer, never by sharing a row.

    `is_online` is a demo lever: an offline system rejects writes with 503 so
    the partial-failure and retry flows can be shown deterministically, without
    relying on random flakiness.
    """

    __tablename__ = "mock_gov_records"
    __table_args__ = (
        UniqueConstraint("user_id", "system", name="uq_mock_gov_user_system"),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    system: Mapped[str] = mapped_column(String(16), nullable=False)
    address: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    phone: Mapped[str] = mapped_column(String(20), default="")
    is_online: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
