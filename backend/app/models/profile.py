from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class Profile(Base, UUIDMixin, TimestampMixin):
    """
    A person whose government paperwork the reader manages — themselves, or a
    family member they help (with consent). "Self" is created automatically.
    Documents stay tied to the correct person through DocumentProfile.
    """

    __tablename__ = "profiles"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # "self", "mother", "father", "spouse", "child", "other" — free text label.
    relationship_label: Mapped[str] = mapped_column(String(48), default="other")
    is_self: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship()


class DocumentProfile(Base, UUIDMixin, TimestampMixin):
    """Which person a stored document belongs to. Keyed by the document slug."""

    __tablename__ = "document_profiles"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    document_slug: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    profile_id: Mapped[str] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False
    )
