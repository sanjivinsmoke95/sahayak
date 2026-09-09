from fastapi import APIRouter
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.config import settings
from app.database import get_db
from app.models import Document
from app.services import scheme_catalog as catalog

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


@router.get("/public/stats")
async def public_stats(db: AsyncSession = Depends(get_db)) -> dict[str, object]:
    """Public aggregate stats — no auth required. Used by the marketing homepage."""
    total_docs_result = await db.execute(select(func.count()).select_from(Document))
    total_docs = total_docs_result.scalar() or 0

    done_docs_result = await db.execute(
        select(func.count()).select_from(Document).where(
            Document.status.in_(["done", "info"])
        )
    )
    done_docs = done_docs_result.scalar() or 0

    return {
        "schemes_total": len(catalog.SCHEMES),
        "scheme_categories": len(catalog.CATEGORIES),
        "documents_total": total_docs,
        "documents_analyzed": done_docs,
        "languages": 3,
        "document_types": 10,
    }
