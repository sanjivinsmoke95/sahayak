from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDMixin


class AIModel(Base, UUIDMixin, TimestampMixin):
    """
    A selectable model. Rows are reconciled with the configured API keys at
    startup, so the picker never offers a provider that cannot answer.
    """

    __tablename__ = "ai_models"

    provider: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    model_key: Mapped[str] = mapped_column(String(120), nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=False)
