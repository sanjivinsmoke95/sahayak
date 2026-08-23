"""
Application lifecycle: create from a service, move through statuses, keep a
persisted timeline. Readiness is not stored — it is recomputed from the user's
current documents so it never goes stale.
"""

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Application, ApplicationEvent, User
from app.models.application import APPLICATION_STATUSES
from app.services.service_catalog import get_service

_SUBMITTED_STATUSES = {
    "submitted",
    "under_review",
    "additional_information_required",
    "approved",
    "rejected",
    "completed",
}


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def to_api(app: Application) -> dict[str, Any]:
    return {
        "id": app.id,
        "serviceId": app.service_id,
        "status": app.status,
        "notes": app.notes,
        "submittedAt": _iso(app.submitted_at),
        "createdAt": _iso(app.created_at),
        "updatedAt": _iso(app.updated_at),
    }


def timeline(app: Application) -> list[dict[str, Any]]:
    return [
        {
            "oldStatus": event.old_status,
            "newStatus": event.new_status,
            "source": event.source,
            "note": event.note,
            "at": _iso(event.created_at),
        }
        for event in app.events
    ]


async def list_applications(db: AsyncSession, user: User) -> list[Application]:
    result = await db.execute(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
    )
    return list(result.scalars().all())


async def get_application(db: AsyncSession, user: User, app_id: str) -> Application | None:
    result = await db.execute(
        select(Application)
        .where(Application.id == app_id, Application.user_id == user.id)
        .options(selectinload(Application.events))
    )
    return result.scalar_one_or_none()


async def create_application(db: AsyncSession, user: User, service_id: str) -> Application | None:
    if get_service(service_id) is None:
        return None
    # One application per service per user keeps the dashboard clean.
    existing = await db.execute(
        select(Application).where(
            Application.user_id == user.id, Application.service_id == service_id
        )
    )
    found = existing.scalar_one_or_none()
    if found:
        return await get_application(db, user, found.id)

    app = Application(user_id=user.id, service_id=service_id, status="preparing")
    app.events.append(
        ApplicationEvent(old_status=None, new_status="preparing", source="system")
    )
    db.add(app)
    await db.flush()
    return await get_application(db, user, app.id)


async def update_status(
    db: AsyncSession, app: Application, status: str, note: str | None
) -> Application:
    old = app.status
    app.status = status
    if status in _SUBMITTED_STATUSES and app.submitted_at is None:
        app.submitted_at = datetime.now(timezone.utc)
    app.events.append(
        ApplicationEvent(old_status=old, new_status=status, source="user", note=note)
    )
    await db.flush()
    return app


def is_valid_status(status: str) -> bool:
    return status in APPLICATION_STATUSES
