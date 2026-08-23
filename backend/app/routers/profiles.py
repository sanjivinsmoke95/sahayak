"""Family / caregiver profiles and document-to-person assignment."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.profile import DocumentProfileUpdate, ProfileCreate, ProfileRead
from app.services import document_service as docs
from app.services import profile_service as profiles

router = APIRouter(tags=["profiles"])


@router.get("/profiles", response_model=list[ProfileRead])
async def list_profiles(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    return [profiles.to_api(p) for p in await profiles.list_profiles(db, user)]


@router.post("/profiles", response_model=ProfileRead, status_code=status.HTTP_201_CREATED)
async def create_profile(
    payload: ProfileCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    profile = await profiles.create_profile(db, user, payload.name, payload.relationship)
    return profiles.to_api(profile)


@router.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    ok = await profiles.delete_profile(db, user, profile_id)
    if not ok:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This profile cannot be deleted.")


@router.patch("/documents/{slug}/profile", status_code=status.HTTP_204_NO_CONTENT)
async def assign_document_profile(
    slug: str,
    payload: DocumentProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    document = await docs.get_document_by_slug(db, user, slug)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    profile = await profiles.get_profile(db, user, payload.profileId)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    await profiles.assign_document(db, user, slug, payload.profileId)
