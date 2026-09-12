"""The citizen's canonical profile, and the five independent mock systems.

On first use a citizen gets one ``CitizenProfile`` (their own source of truth)
and five ``MockGovRecord`` rows — one per government system — seeded to the same
starting values so the demonstration opens from a consistent state. The seed is
clearly demo data, not a real record; a fresh account has nothing to change
otherwise.
"""

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import CitizenProfile, MockGovRecord, User
from app.models.interoperability import GOV_SYSTEM_LABELS, GOV_SYSTEMS
from app.services.interoperability import canonical

# Demo seed so the unified profile opens populated and in-sync across systems.
# This is prototype data, never a real citizen record.
SEED_ADDRESS: dict[str, str] = {
    "line1": "12-3-45, Ashok Nagar",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500020",
}
SEED_PHONE = "9876543210"
SEED_DOB = "1998-06-15"


async def get_profile(db: AsyncSession, user: User) -> CitizenProfile | None:
    result = await db.execute(
        select(CitizenProfile).where(CitizenProfile.user_id == user.id)
    )
    return result.scalar_one_or_none()


async def ensure_profile(db: AsyncSession, user: User) -> CitizenProfile:
    """Get the citizen's canonical profile, creating and seeding it once."""
    profile = await get_profile(db, user)
    if profile is None:
        profile = CitizenProfile(
            user_id=user.id,
            full_name=(getattr(user, "display_name", "") or "Demo Citizen"),
            dob=SEED_DOB,
            address=dict(SEED_ADDRESS),
            phone=SEED_PHONE,
        )
        db.add(profile)
        await db.flush()
    await ensure_mock_records(db, user, profile)
    return profile


async def ensure_mock_records(
    db: AsyncSession, user: User, profile: CitizenProfile
) -> list[MockGovRecord]:
    """Make sure all five systems have a record, seeded from the profile."""
    result = await db.execute(
        select(MockGovRecord).where(MockGovRecord.user_id == user.id)
    )
    existing = {record.system: record for record in result.scalars().all()}

    created = False
    for system in GOV_SYSTEMS:
        if system not in existing:
            record = MockGovRecord(
                user_id=user.id,
                system=system,
                address=dict(profile.address or {}),
                phone=profile.phone or "",
                is_online=True,
            )
            db.add(record)
            existing[system] = record
            created = True
    if created:
        await db.flush()
    return [existing[system] for system in GOV_SYSTEMS]


async def list_mock_records(db: AsyncSession, user: User) -> list[MockGovRecord]:
    profile = await ensure_profile(db, user)
    return await ensure_mock_records(db, user, profile)


async def set_system_health(
    db: AsyncSession, user: User, system: str, online: bool
) -> MockGovRecord | None:
    """Demo lever: take one system offline (or back online)."""
    result = await db.execute(
        select(MockGovRecord).where(
            MockGovRecord.user_id == user.id, MockGovRecord.system == system
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        return None
    record.is_online = online
    await db.flush()
    return record


def profile_to_api(profile: CitizenProfile) -> dict[str, Any]:
    return {
        "fullName": profile.full_name or "",
        "dob": profile.dob or "",
        "address": canonical.normalise_address(profile.address),
        "phone": profile.phone or "",
    }


def mock_to_api(record: MockGovRecord) -> dict[str, Any]:
    return {
        "system": record.system,
        "label": GOV_SYSTEM_LABELS.get(record.system, record.system),
        "address": canonical.normalise_address(record.address),
        "phone": record.phone or "",
        "isOnline": record.is_online,
    }
