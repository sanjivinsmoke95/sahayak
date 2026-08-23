"""Shared FastAPI dependencies, re-exported so routers import from one place."""

from app.auth import get_current_user
from app.database import get_db

__all__ = ["get_current_user", "get_db"]
