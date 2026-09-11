"""The five simulated government systems (SIH26129).

Each system is an independent service with its own copy of a citizen's contact
data, reached only through this API — the connectors never touch the mock
tables directly. That boundary is the point: it shows how authorised systems
*could* interoperate through a common layer, without any of them sharing a row.

These endpoints stand in for external departmental services, so they are not
behind the citizen's session. When ``MOCK_GOV_API_KEY`` is set they require the
matching ``X-Gov-Api-Key`` header (system-to-system auth); blank leaves them
open for a local demo. Writes only ever touch throwaway mock records.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.config import settings
from app.models import MockGovRecord
from app.models.interoperability import GOV_SYSTEM_LABELS, GOV_SYSTEMS
from app.schemas.interoperability import GovSystem, MockCitizenRead
from app.services.interoperability import canonical
from app.services.interoperability.citizen_profile import mock_to_api

router = APIRouter(prefix="/mock-gov", tags=["mock-government"])


def _authorise(x_gov_api_key: str | None = Header(default=None)) -> None:
    if settings.mock_gov_api_key and x_gov_api_key != settings.mock_gov_api_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid government API key")


def _validate_system(system: str) -> None:
    if system not in GOV_SYSTEMS:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown government system")


async def _get_record(db: AsyncSession, system: str, citizen_id: str) -> MockGovRecord:
    result = await db.execute(
        select(MockGovRecord).where(
            MockGovRecord.user_id == citizen_id, MockGovRecord.system == system
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such citizen in this system")
    return record


def _require_online(record: MockGovRecord) -> None:
    if not record.is_online:
        # A real departmental outage looks like this to the connector.
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            f"{GOV_SYSTEM_LABELS.get(record.system, record.system)} is temporarily unavailable",
        )


@router.get("/{system}/citizen/{citizen_id}", response_model=MockCitizenRead)
async def read_citizen(
    system: GovSystem,
    citizen_id: str,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_authorise),
) -> dict:
    _validate_system(system)
    record = await _get_record(db, system, citizen_id)
    return mock_to_api(record)


@router.put("/{system}/citizen/{citizen_id}/address", response_model=MockCitizenRead)
async def update_address(
    system: GovSystem,
    citizen_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_authorise),
) -> dict:
    _validate_system(system)
    record = await _get_record(db, system, citizen_id)
    _require_online(record)
    record.address = canonical.normalise_address(payload.get("address"))
    await db.flush()
    return mock_to_api(record)


@router.put("/{system}/citizen/{citizen_id}/phone", response_model=MockCitizenRead)
async def update_phone(
    system: GovSystem,
    citizen_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(_authorise),
) -> dict:
    _validate_system(system)
    record = await _get_record(db, system, citizen_id)
    _require_online(record)
    record.phone = canonical.normalise_phone(payload.get("phone"))
    await db.flush()
    return mock_to_api(record)
