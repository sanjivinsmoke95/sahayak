from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.message import Message
    from app.models.user import User


class Chat(Base, UUIDMixin, TimestampMixin):
    """One assistant conversation, optionally about a specific document."""

    __tablename__ = "chats"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    document_id: Mapped[str | None] = mapped_column(
        ForeignKey("documents.id", ondelete="SET NULL"), index=True
    )
    ai_model_id: Mapped[str | None] = mapped_column(ForeignKey("ai_models.id", ondelete="SET NULL"))

    title: Mapped[str] = mapped_column(String(200), default="")
    language: Mapped[str] = mapped_column(String(4), default="en")

    user: Mapped["User"] = relationship(back_populates="chats")
    messages: Mapped[list["Message"]] = relationship(
        back_populates="chat", cascade="all, delete-orphan", order_by="Message.created_at"
    )
