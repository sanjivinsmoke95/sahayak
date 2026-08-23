from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.user import User


class File(Base, UUIDMixin, TimestampMixin):
    """
    An uploaded file in Supabase Storage.

    `original_size_bytes` records what the file weighed on the phone before
    client-side compression, which is what makes the savings reportable.
    """

    __tablename__ = "files"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    document_id: Mapped[str | None] = mapped_column(
        ForeignKey("documents.id", ondelete="SET NULL"), index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(128), default="application/octet-stream")
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    original_size_bytes: Mapped[int | None] = mapped_column(BigInteger)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)

    user: Mapped["User"] = relationship(back_populates="files")
    document: Mapped["Document | None"] = relationship(back_populates="files")
