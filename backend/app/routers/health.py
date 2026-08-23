from fastapi import APIRouter

from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, object]:
    """Cheap liveness probe that also reports which integrations are wired."""
    return {
        "status": "ok",
        "environment": settings.environment,
        "auth": settings.auth_enabled,
        "storage": settings.storage_enabled,
        "ai_provider": settings.default_ai_provider,
    }
