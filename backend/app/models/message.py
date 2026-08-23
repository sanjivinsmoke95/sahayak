from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.chat import Chat


class Message(Base, UUIDMixin, TimestampMixin):
    """A single turn. Assistant turns may carry a bullet list and document refs."""

    __tablename__ = "messages"

    chat_id: Mapped[str] = mapped_column(
        ForeignKey("chats.id", ondelete="CASCADE"), index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False)  # user | assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)

    bullet_list: Mapped[list[str] | None] = mapped_column(JSONB)
    document_refs: Mapped[list[str] | None] = mapped_column(JSONB)

    provider: Mapped[str | None] = mapped_column(String(32))
    tokens_used: Mapped[int | None] = mapped_column(Integer)

    chat: Mapped["Chat"] = relationship(back_populates="messages")
