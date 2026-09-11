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
    identity,
    intelligence,
    interoperability,
    mock_gov,
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
from app.services.identity_crypto import crypto_available
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


class InsecureConfiguration(RuntimeError):
    """A setting that is a convenience locally and a breach anywhere else."""


def verify_production_configuration() -> None:
    """Refuse to serve real traffic with development shortcuts left switched on.

    Both of these fail open by design so a fresh clone runs: without Clerk every
    request becomes the same development user, and without encryption keys the
    identity endpoints stay disabled. Locally that is helpful. On a deployed
    instance the first one silently pools every visitor into one account, where
    they read each other's documents — so outside development it has to stop the
    process rather than log a line nobody reads.
    """
    if settings.environment == "development":
        if not settings.auth_enabled:
            logger.warning(
                "Clerk is not configured — every request runs as the development user. "
                "This is refused outside development."
            )
        if not crypto_available():
            logger.warning(
                "IDENTITY_ENCRYPTION_KEYS is not set — Aadhaar/PAN storage is disabled. "
                "See backend/.env.example; the app never stores these values unencrypted."
            )
        return

    problems: list[str] = []
    if not settings.auth_enabled:
        problems.append(
            "CLERK_ISSUER is empty, so authentication is disabled and every request "
            "would share a single account. Set it, or set ENVIRONMENT=development."
        )
    if settings.cors_origin_list == ["*"] or "*" in settings.cors_origin_list:
        problems.append("CORS_ORIGINS is a wildcard. Name the origins that may call this API.")
    if not problems:
        return

    for problem in problems:
        logger.critical("Refusing to start: %s", problem)
    raise InsecureConfiguration(
        f"Unsafe configuration for ENVIRONMENT={settings.environment!r}: "
        + " ".join(problems)
    )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    configure_logging()
    logger.info("Starting %s in %s mode", settings.app_name, settings.environment)
    verify_production_configuration()
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


@app.middleware("http")
async def security_headers(request, call_next):
    """Baseline hardening for every response.

    HSTS is only meaningful over TLS and is harmful on a plain-HTTP dev origin,
    so it is sent outside development only.
    """
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Cross-Origin-Resource-Policy", "same-origin")
    if settings.environment != "development":
        response.headers.setdefault(
            "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
        )
    return response

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
    identity.router,
):
    app.include_router(router, prefix=settings.api_prefix)

# Interoperability (SIH26129) is registered only while enabled, so the whole
# feature — the citizen API and the five mock systems — can be switched off with
# a single flag without touching anything else.
if settings.interop_enabled:
    app.include_router(interoperability.router, prefix=settings.api_prefix)
    app.include_router(mock_gov.router, prefix=settings.api_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": settings.app_name, "docs": "/docs"}
