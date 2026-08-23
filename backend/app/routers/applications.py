"""Application management: create from a service, track status and timeline."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationDetailRead,
    ApplicationRead,
    ApplicationStatusUpdate,
)
from app.services import application_service as apps
from app.services import document_intelligence as intel
from app.services import document_service as docs

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationRead])
async def list_applications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    return [apps.to_api(a) for a in await apps.list_applications(db, user)]


@router.post("", response_model=ApplicationDetailRead, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    app = await apps.create_application(db, user, payload.serviceId)
    if app is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown service")
    return await _detail(db, user, app)


@router.get("/{app_id}", response_model=ApplicationDetailRead)
async def get_application(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    app = await apps.get_application(db, user, app_id)
    if app is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return await _detail(db, user, app)


@router.patch("/{app_id}", response_model=ApplicationDetailRead)
async def update_application(
    app_id: str,
    payload: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    if not apps.is_valid_status(payload.status):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Unknown status")
    app = await apps.get_application(db, user, app_id)
    if app is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    await apps.update_status(db, app, payload.status, payload.note)
    # Re-read so server-generated columns (updated_at) and the new timeline
    # event are freshly loaded within the async context.
    fresh = await apps.get_application(db, user, app_id)
    return await _detail(db, user, fresh or app)


async def _detail(db: AsyncSession, user: User, app) -> dict:
    documents = await docs.get_user_documents(db, user)
    readiness = intel.compute_readiness(app.service_id, documents)
    return {
        **apps.to_api(app),
        "readiness": readiness,
        "timeline": apps.timeline(app),
    }
