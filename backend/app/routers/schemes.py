"""
Government scheme knowledge (myScheme reference dataset): browse, search, open,
and match against the reader's uploaded documents. Every response carries the
dataset provenance so the UI can label it "needs verification".
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.scheme import (
    SchemeMatchResult,
    SchemeRead,
    SchemeSearchResult,
)
from app.services import document_service as docs
from app.services import scheme_catalog as catalog

router = APIRouter(prefix="/schemes", tags=["schemes"])


# Static paths are declared before /{scheme_id} so they are never read as an id.
@router.get("/categories", response_model=list[str])
async def scheme_categories(_user: User = Depends(get_current_user)) -> list[str]:
    return catalog.CATEGORIES


@router.get("/matches", response_model=SchemeMatchResult)
async def scheme_matches(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SchemeMatchResult:
    """Schemes the reader may be able to use, matched by their uploaded documents."""
    documents = await docs.get_user_documents(db, user)
    tags = docs.detected_tags(documents)
    return SchemeMatchResult(results=catalog.match_schemes(tags))


@router.get("", response_model=SchemeSearchResult)
async def search_schemes(
    q: str | None = None,
    category: str | None = None,
    level: str | None = None,
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    _user: User = Depends(get_current_user),
) -> SchemeSearchResult:
    return SchemeSearchResult(**catalog.search_schemes(q, category, level, limit, offset))


@router.get("/{scheme_id}", response_model=SchemeRead)
async def get_scheme(
    scheme_id: str,
    _user: User = Depends(get_current_user),
) -> SchemeRead:
    scheme = catalog.get_scheme(scheme_id)
    if not scheme:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scheme not found")
    return SchemeRead(**scheme)
