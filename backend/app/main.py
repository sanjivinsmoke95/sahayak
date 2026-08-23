"""
SAHAYAK API.

Run with:  uvicorn app.main:app --reload
Docs at:   http://localhost:8000/docs
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal, Base, engine
from app.models import AIModel
from app.routers import (
    ai_models,
    applications,
    assistant,
    chats,
    documents,
    files,
    health,
    intelligence,
    places,
    profiles,
    projects,
    schemes,
    services,
    users,
)
from app.routers import (
    settings as settings_router,
)
from app.services.ai.factory import _REGISTRY
from app.utils import configure_logging

logger = logging.getLogger(__name__)


async def sync_ai_models() -> None:
    """
    Reconcile the model catalogue with the keys actually configured, so the
    picker never offers a provider that would fail on first use.
    """
    async with AsyncSessionLocal() as db:
        for provider_name, provider_cls in _REGISTRY.items():
            provider = provider_cls()
            result = await db.execute(select(AIModel).where(AIModel.provider == provider_name))
            record = result.scalar_one_or_none()

            if record is None:
                db.add(
                    AIModel(
                        provider=provider_name,
                        model_key=getattr(provider, "model", provider_name),
                        display_name=provider_name.replace("-", " ").title(),
                        is_available=provider.available,
                        is_default=provider_name == settings.default_ai_provider,
                    )
                )
            else:
                record.is_available = provider.available
                record.is_default = provider_name == settings.default_ai_provider

        await db.commit()


async def ensure_database_schema() -> None:
    """Create missing tables when the app starts on a fresh database."""
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    configure_logging()
    logger.info("Starting %s in %s mode", settings.app_name, settings.environment)
    if not settings.auth_enabled:
        logger.warning("Clerk is not configured — every request runs as the development user")
    try:
        await ensure_database_schema()
        await sync_ai_models()
    except Exception as exc:
        logger.exception("Database initialization failed: %s", exc)
    yield
    logger.info("Shutting down")


app = FastAPI(
    title=settings.app_name,
    description="Explains government documents in plain language, in English, Hindi and Telugu.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    health.router,
    users.router,
    documents.router,
    assistant.router,
    files.router,
    settings_router.router,
    ai_models.router,
    chats.router,
    projects.router,
    services.router,
    places.router,
    intelligence.router,
    applications.router,
    profiles.router,
    schemes.router,
):
    app.include_router(router, prefix=settings.api_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": settings.app_name, "docs": "/docs"}
