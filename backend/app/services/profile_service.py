"""
Family / caregiver profiles: a reader can manage paperwork for themselves and
for relatives they help. Each document is tied to exactly one person through
DocumentProfile, so documents are never mixed between people.
"""

from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DocumentProfile, Profile, User


def to_api(profile: Profile) -> dict[str, Any]:
    return {
        "id": profile.id,
        "name": profile.name,
        "relationship": profile.relationship_label,
        "isSelf": profile.is_self,
    }


async def ensure_self_profile(db: AsyncSession, user: User) -> Profile:
    """Every account has a "Self" profile; create it on first use."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user.id, Profile.is_self.is_(True))
    )
    self_profile = result.scalar_one_or_none()
    if self_profile:
        return self_profile

    name = (user.name or "Me") if hasattr(user, "name") else "Me"
    self_profile = Profile(
        user_id=user.id, name=name or "Me", relationship_label="self", is_self=True
    )
    db.add(self_profile)
    await db.flush()
    return self_profile


async def list_profiles(db: AsyncSession, user: User) -> list[Profile]:
    await ensure_self_profile(db, user)
    result = await db.execute(
        select(Profile).where(Profile.user_id == user.id).order_by(Profile.is_self.desc(), Profile.created_at)
    )
    return list(result.scalars().all())


async def create_profile(db: AsyncSession, user: User, name: str, relationship: str) -> Profile:
    profile = Profile(
        user_id=user.id, name=name.strip(), relationship_label=relationship or "other", is_self=False
    )
    db.add(profile)
    await db.flush()
    return profile


async def get_profile(db: AsyncSession, user: User, profile_id: str) -> Profile | None:
    result = await db.execute(
        select(Profile).where(Profile.id == profile_id, Profile.user_id == user.id)
    )
    return result.scalar_one_or_none()


async def delete_profile(db: AsyncSession, user: User, profile_id: str) -> bool:
    profile = await get_profile(db, user, profile_id)
    if not profile or profile.is_self:
        return False
    # Its document assignments fall away; those documents revert to unassigned.
    await db.execute(
        delete(DocumentProfile).where(
            DocumentProfile.user_id == user.id, DocumentProfile.profile_id == profile_id
        )
    )
    await db.delete(profile)
    return True


async def assign_document(db: AsyncSession, user: User, slug: str, profile_id: str) -> None:
    result = await db.execute(
        select(DocumentProfile).where(
            DocumentProfile.user_id == user.id, DocumentProfile.document_slug == slug
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.profile_id = profile_id
    else:
        db.add(DocumentProfile(user_id=user.id, document_slug=slug, profile_id=profile_id))
    await db.flush()


async def assignments_map(db: AsyncSession, user: User) -> dict[str, str]:
    """slug -> profile_id for all of the user's assigned documents."""
    result = await db.execute(
        select(DocumentProfile.document_slug, DocumentProfile.profile_id).where(
            DocumentProfile.user_id == user.id
        )
    )
    return {slug: profile_id for slug, profile_id in result.all()}
