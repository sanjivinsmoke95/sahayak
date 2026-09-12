"""The synchronization engine: consent -> connectors -> results -> audit.

This module owns the workflow. It records consent, writes the change to the
citizen's canonical profile (the source of truth), fans the change out to each
targeted system through its connector, and records a per-system result that a
retry can later resume. It never contains any per-system logic — that lives in
the connectors — so adding a sixth system is a connector, not a change here.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import SyncBatch, SyncConsent, SyncResult, User
from app.models.interoperability import GOV_SYSTEM_LABELS
from app.services.interoperability import canonical, citizen_profile
from app.services.interoperability.connectors import (
    ConnectorError,
    build_connector,
    make_client,
)

logger = logging.getLogger(__name__)


def _recompute_status(batch: SyncBatch) -> None:
    statuses = {result.status for result in batch.results}
    if not statuses or statuses == {"success"}:
        batch.status = "success"
    elif "success" in statuses:
        batch.status = "partial"
    else:
        batch.status = "failed"


async def _apply_to_systems(
    batch: SyncBatch,
    field: str,
    value: Any,
    client: httpx.AsyncClient,
) -> None:
    """Run every not-yet-successful result in the batch through its connector."""
    for result in batch.results:
        if result.status == "success":
            continue
        connector = build_connector(result.system, client)
        result.attempts += 1
        try:
            if field == "address":
                await connector.update_address(batch.user_id, value)
            else:
                await connector.update_phone(batch.user_id, value)
            result.status = "success"
            result.error = None
        except ConnectorError as exc:
            result.status = "failed"
            result.error = str(exc)[:200]
            # Logged without the value; the logging filter also scrubs numbers.
            logger.info(
                "interop sync failed system=%s field=%s reason=%s",
                result.system,
                field,
                result.error,
            )
    _recompute_status(batch)


async def synchronize(
    db: AsyncSession,
    user: User,
    field: str,
    value: Any,
    targets: list[str],
    consent_granted: bool,
    purpose: str = "cross_system_update",
    client: httpx.AsyncClient | None = None,
) -> SyncBatch:
    """Propagate one field change to the targeted systems, with consent.

    Records consent (granted or denied). On denial nothing else happens: the
    canonical profile is untouched and no system is contacted. On consent, the
    canonical profile is updated first, then the change is fanned out.
    """
    profile = await citizen_profile.ensure_profile(db, user)

    consent = SyncConsent(
        user_id=user.id,
        field=field,
        targets=list(targets),
        purpose=purpose,
        status="granted" if consent_granted else "denied",
    )
    db.add(consent)
    await db.flush()

    old_value = profile.address if field == "address" else profile.phone
    batch = SyncBatch(
        user_id=user.id,
        consent_id=consent.id,
        field=field,
        old_value=canonical.stored_value(field, old_value),
        new_value=canonical.stored_value(field, value),
        status="pending",
    )
    db.add(batch)
    await db.flush()

    if not consent_granted:
        batch.status = "denied"
        await db.flush()
        return await _reload_batch(db, batch.id)

    # The citizen's own record is the source of truth: update it before fan-out.
    if field == "address":
        profile.address = canonical.normalise_address(value)
    else:
        profile.phone = canonical.normalise_phone(value)
    await db.flush()

    for system in targets:
        db.add(SyncResult(batch_id=batch.id, system=system, status="pending", attempts=0))
    await db.flush()
    await db.refresh(batch, attribute_names=["results"])

    # Make the profile change, the seeded mock records and the pending results
    # durable before fan-out. The connectors reach the mock systems over a
    # separate connection (a real API boundary), so they can only see committed
    # rows — an uncommitted seed would look like an unknown citizen (404).
    await db.commit()

    own_client = client is None
    active = client or make_client()
    try:
        await _apply_to_systems(batch, field, _canonical_value(field, value), active)
    finally:
        if own_client:
            await active.aclose()

    await db.flush()
    return await _reload_batch(db, batch.id)


async def retry(
    db: AsyncSession,
    user: User,
    batch_id: str,
    client: httpx.AsyncClient | None = None,
) -> SyncBatch | None:
    """Retry only the failed systems in a batch, using the current true value."""
    batch = await _reload_batch(db, batch_id)
    if batch is None or batch.user_id != user.id:
        return None
    if batch.status in ("success", "denied"):
        return batch

    profile = await citizen_profile.ensure_profile(db, user)
    # The real, unmasked value lives on the profile — never read it back from
    # the (masked) audit record.
    value = profile.address if batch.field == "address" else profile.phone

    own_client = client is None
    active = client or make_client()
    try:
        await _apply_to_systems(batch, batch.field, _canonical_value(batch.field, value), active)
    finally:
        if own_client:
            await active.aclose()

    await db.flush()
    return await _reload_batch(db, batch_id)


async def history(db: AsyncSession, user: User, limit: int = 50) -> list[SyncBatch]:
    result = await db.execute(
        select(SyncBatch)
        .where(SyncBatch.user_id == user.id)
        .options(selectinload(SyncBatch.results))
        .order_by(SyncBatch.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


def _canonical_value(field: str, value: Any) -> Any:
    if field == "address":
        return canonical.normalise_address(value)
    return canonical.normalise_phone(value)


async def _reload_batch(db: AsyncSession, batch_id: str) -> SyncBatch | None:
    result = await db.execute(
        select(SyncBatch)
        .where(SyncBatch.id == batch_id)
        .options(selectinload(SyncBatch.results))
    )
    return result.scalar_one_or_none()


def batch_to_response(batch: SyncBatch) -> dict[str, Any]:
    """Shape a batch as the PUT/retry response (per-system results)."""
    results = [
        {
            "system": result.system,
            "label": GOV_SYSTEM_LABELS.get(result.system, result.system),
            "status": result.status,
            "error": result.error,
            "attempts": result.attempts,
        }
        for result in batch.results
    ]
    return {
        "batchId": batch.id,
        "field": batch.field,
        "success": batch.status == "success",
        "status": batch.status,
        "results": results,
    }


def batch_to_history(batch: SyncBatch) -> dict[str, Any]:
    payload = batch_to_response(batch)
    return {
        "batchId": batch.id,
        "field": batch.field,
        "status": batch.status,
        "oldValue": batch.old_value,
        "newValue": batch.new_value,
        "consented": batch.status != "denied",
        "results": payload["results"],
        "at": batch.created_at.isoformat() if batch.created_at else "",
    }
