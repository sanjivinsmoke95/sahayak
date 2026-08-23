"""
Document- and application-intelligence endpoints.

Everything here is read-only and computed from the reader's own already-stored
documents — validity, cross-document consistency, application readiness, and a
single-document "can I use this here?" check. Each response is grounded in the
document text and carries a status, so the UI never presents an inference as an
official decision.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.intelligence import (
    ConsistencyRead,
    DiscoveryRead,
    ReadinessRead,
    UsableForRead,
    ValidityRead,
)
from app.schemas.workflows import FormRead, RejectionRead, VerificationRead
from app.services import discover as discovery
from app.services import document_intelligence as intel
from app.services import document_service as docs
from app.services import document_workflows as flows

router = APIRouter(tags=["intelligence"])


@router.get("/documents/{slug}/validity", response_model=ValidityRead)
async def document_validity(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ValidityRead:
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return ValidityRead(**intel.extract_validity(document.raw_text))


@router.get("/consistency", response_model=ConsistencyRead)
async def documents_consistency(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ConsistencyRead:
    documents = await docs.get_user_documents(db, user)
    return ConsistencyRead(issues=intel.find_consistency_issues(documents))


@router.get("/discovery", response_model=DiscoveryRead)
async def services_discovery(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DiscoveryRead:
    documents = await docs.get_user_documents(db, user)
    return DiscoveryRead(**discovery.discover_services(documents))


@router.get("/services/{service_id}/readiness", response_model=ReadinessRead)
async def service_readiness(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ReadinessRead:
    documents = await docs.get_user_documents(db, user)
    result = intel.compute_readiness(service_id, documents)
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown service")
    return ReadinessRead(**result)


@router.get("/documents/{slug}/usable-for/{service_id}", response_model=UsableForRead)
async def document_usable_for(
    slug: str,
    service_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> UsableForRead:
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    result = intel.usable_for(document, service_id)
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown service")
    return UsableForRead(**result)


@router.get("/documents/{slug}/rejection", response_model=RejectionRead)
async def document_rejection(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RejectionRead:
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return RejectionRead(**flows.analyze_rejection(document.raw_text))


@router.get("/documents/{slug}/verification", response_model=VerificationRead)
async def document_verification(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> VerificationRead:
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return VerificationRead(**flows.verification_signals(document.raw_text))


@router.get("/documents/{slug}/form", response_model=FormRead)
async def document_form(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> FormRead:
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    documents = await docs.get_user_documents(db, user)
    return FormRead(**flows.analyze_form(document.raw_text, documents))
