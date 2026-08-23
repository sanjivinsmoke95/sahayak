from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class Setting(Base, UUIDMixin, TimestampMixin):
    """Per-user preferences, so a new phone opens in the right language."""

    __tablename__ = "settings"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )

    language: Mapped[str] = mapped_column(String(4), default="en")
    text_size: Mapped[str] = mapped_column(String(16), default="standard")
    read_aloud: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_shrink: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship(back_populates="setting")
