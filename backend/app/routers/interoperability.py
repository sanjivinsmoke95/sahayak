"""The citizen-facing interoperability API (SIH26129).

A citizen changes their address or phone once here, consents to sharing it, and
the change is propagated to the connected government systems. Every route is
scoped to the authenticated user through ``get_current_user``; nothing accepts a
citizen id from the caller, so one user can only ever move their own data.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.config import settings
from app.models import User
from app.schemas.interoperability import (
    AddressUpdateRequest,
    CitizenProfileRead,
    CitizenProfileUpdate,
    GovSystem,
    MockCitizenRead,
    PhoneUpdateRequest,
    PincodeReference,
    SyncBatchRead,
    SyncResponse,
    SystemHealthToggle,
)
from app.services.interoperability import citizen_profile, sync_service
from app.services.interoperability.reference import lookup_pincode

router = APIRouter(prefix="/interoperability", tags=["interoperability"])

# A change and its propagation must not sit in a shared cache.
_NO_STORE = {"Cache-Control": "no-store, private"}


def _require_enabled() -> None:
    if not settings.interop_enabled:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "The interoperability feature is disabled."
        )


@router.get("/profile", response_model=CitizenProfileRead)
async def read_profile(
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    _require_enabled()
    response.headers.update(_NO_STORE)
    profile = await citizen_profile.ensure_profile(db, user)
    return citizen_profile.profile_to_api(profile)


@router.patch("/profile", response_model=CitizenProfileRead)
async def update_profile(
    payload: CitizenProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Edit display-only identity fields (name, DOB). Never propagated."""
    _require_enabled()
    profile = await citizen_profile.ensure_profile(db, user)
    if payload.fullName is not None:
        profile.full_name = payload.fullName.strip()
    if payload.dob is not None:
        profile.dob = payload.dob.strip()
    await db.flush()
    return citizen_profile.profile_to_api(profile)


@router.get("/systems", response_model=list[MockCitizenRead])
async def list_systems(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    """Each connected system's own current view of the citizen."""
    _require_enabled()
    records = await citizen_profile.list_mock_records(db, user)
    return [citizen_profile.mock_to_api(r) for r in records]


@router.put("/address", response_model=SyncResponse)
async def update_address(
    payload: AddressUpdateRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    _require_enabled()
    response.headers.update(_NO_STORE)
    if not payload.consent:
        # No consent, no propagation — recorded as a denied batch for the trail.
        batch = await sync_service.synchronize(
            db, user, "address", payload.value.model_dump(), payload.targets,
            consent_granted=False, purpose=payload.purpose,
        )
        return sync_service.batch_to_response(batch)
    if not payload.targets:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Select at least one system to update.")
    batch = await sync_service.synchronize(
        db, user, "address", payload.value.model_dump(), payload.targets,
        consent_granted=True, purpose=payload.purpose,
    )
    return sync_service.batch_to_response(batch)


@router.put("/phone", response_model=SyncResponse)
async def update_phone(
    payload: PhoneUpdateRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    _require_enabled()
    response.headers.update(_NO_STORE)
    if not payload.consent:
        batch = await sync_service.synchronize(
            db, user, "phone", payload.value, payload.targets,
            consent_granted=False, purpose=payload.purpose,
        )
        return sync_service.batch_to_response(batch)
    if not payload.targets:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Select at least one system to update.")
    batch = await sync_service.synchronize(
        db, user, "phone", payload.value, payload.targets,
        consent_granted=True, purpose=payload.purpose,
    )
    return sync_service.batch_to_response(batch)


@router.post("/sync/{batch_id}/retry", response_model=SyncResponse)
async def retry_sync(
    batch_id: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    _require_enabled()
    response.headers.update(_NO_STORE)
    batch = await sync_service.retry(db, user, batch_id)
    if batch is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such synchronization batch.")
    return sync_service.batch_to_response(batch)


@router.get("/history", response_model=list[SyncBatchRead])
async def read_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    _require_enabled()
    batches = await sync_service.history(db, user)
    return [sync_service.batch_to_history(b) for b in batches]


@router.post("/systems/{system}/simulate", response_model=MockCitizenRead)
async def simulate_system_health(
    system: GovSystem,
    payload: SystemHealthToggle,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Demo control: take one connected system offline, or bring it back.

    Authenticated as the citizen and scoped to their own mock records, so the
    partial-failure and retry flows are demonstrable from the UI without the
    browser ever holding the mock-system API key.
    """
    _require_enabled()
    await citizen_profile.ensure_profile(db, user)  # make sure records exist
    record = await citizen_profile.set_system_health(db, user, system, payload.online)
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown system")
    return citizen_profile.mock_to_api(record)


@router.get("/reference/pincode/{pincode}", response_model=PincodeReference)
async def reference_pincode(
    pincode: str,
    user: User = Depends(get_current_user),
) -> dict:
    """Optional data.gov.in reference lookup. Works (empty) without a key."""
    _require_enabled()
    return await lookup_pincode(pincode)
