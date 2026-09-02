from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas import (
    AskRequest,
    AskResponse,
    EligibilityRequest,
    EligibilityResponse,
)
from app.services import document_service as docs
from app.services.ai.grounded_assistant import answer_question
from app.services.eligibility import check_eligibility

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/ask", response_model=AskResponse)
async def ask(
    payload: AskRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AskResponse:
    """
    Answers a question about the reader's own paperwork.

    The model only ever sees documents belonging to this user, and the
    rule-based engine takes over whenever a provider is unavailable, so the
    assistant never goes silent.
    """
    return await answer_question(
        db=db,
        user=user,
        question=payload.question,
        lang=payload.lang,
        document_id=payload.documentId,
        model_id=payload.modelId,
        history=payload.history or [],
    )


@router.post("/eligibility", response_model=EligibilityResponse)
async def eligibility(
    payload: EligibilityRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> EligibilityResponse:
    document = await docs.get_document_by_slug(db, user, payload.documentId)
    if not document or not document.eligibility:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No conditions on this document")

    return check_eligibility(document.eligibility, payload.profile, payload.lang)
