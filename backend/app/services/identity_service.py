"""Storage, retrieval and auditing of a user's identity numbers.

Every function here takes the authenticated `User` object and derives the owner
id from it. None of them accept a user id from a caller, which is what keeps a
crafted request from reaching another person's row.
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import IdentityAuditLog, User, UserIdentity
from app.services.identity_crypto import binding, seal, unseal
from app.services.identity_validation import mask, validate

logger = logging.getLogger(__name__)

KINDS = ("aadhaar", "pan")


async def record_audit(
    db: AsyncSession,
    *,
    owner_id: str,
    actor_id: str,
    kind: str,
    action: str,
    success: bool = True,
    detail: str = "",
) -> None:
    """Append one metadata-only audit row.

    The application log gets the same facts and no more — no value, no
    ciphertext, no key version.
    """
    db.add(
        IdentityAuditLog(
            user_id=owner_id,
            actor_user_id=actor_id,
            kind=kind,
            action=action,
            success=success,
            detail=detail[:64],
        )
    )
    logger.info(
        "identity action=%s kind=%s owner=%s actor=%s success=%s detail=%s",
        action, kind, owner_id, actor_id, success, detail or "-",
    )


async def get_row(db: AsyncSession, user: User, kind: str) -> UserIdentity | None:
    """Fetch one identity row, always constrained to the authenticated owner."""
    result = await db.execute(
        select(UserIdentity).where(
            UserIdentity.user_id == user.id, UserIdentity.kind == kind
        )
    )
    return result.scalar_one_or_none()


async def list_masked(db: AsyncSession, user: User) -> list[dict[str, Any]]:
    """Every identity this user holds, in display form. Decrypts nothing."""
    result = await db.execute(
        select(UserIdentity).where(UserIdentity.user_id == user.id).order_by(UserIdentity.kind)
    )
    return [
        {"kind": row.kind, "masked": row.masked, "updatedAt": row.updated_at}
        for row in result.scalars().all()
    ]


async def upsert(db: AsyncSession, user: User, kind: str, raw_value: str) -> dict[str, Any]:
    """Validate, encrypt and store. Raises IdentityValidationError on bad input."""
    value = validate(kind, raw_value)
    sealed = seal(value, aad=binding(user.id, kind))
    masked = mask(kind, value)

    row = await get_row(db, user, kind)
    action = "updated" if row else "created"
    if row:
        row.ciphertext = sealed.ciphertext
        row.key_version = sealed.key_version
        row.masked = masked
    else:
        row = UserIdentity(
            user_id=user.id,
            kind=kind,
            ciphertext=sealed.ciphertext,
            key_version=sealed.key_version,
            masked=masked,
        )
        db.add(row)

    await record_audit(db, owner_id=user.id, actor_id=user.id, kind=kind, action=action)
    await db.flush()
    return {"kind": kind, "masked": masked, "updatedAt": row.updated_at}


async def reveal(db: AsyncSession, user: User, kind: str) -> str:
    """Decrypt one value for its owner. The only path that produces plaintext."""
    row = await get_row(db, user, kind)
    if row is None:
        await record_audit(
            db, owner_id=user.id, actor_id=user.id, kind=kind,
            action="viewed", success=False, detail="not_found",
        )
        raise LookupError(kind)

    # Binding is rebuilt from the authenticated user, so a row that was moved
    # between accounts in the database fails here rather than decrypting.
    value = unseal(row.ciphertext, row.key_version, aad=binding(user.id, kind))
    await record_audit(db, owner_id=user.id, actor_id=user.id, kind=kind, action="viewed")
    return value


async def delete(db: AsyncSession, user: User, kind: str) -> bool:
    row = await get_row(db, user, kind)
    if row is None:
        return False
    await db.delete(row)
    await record_audit(db, owner_id=user.id, actor_id=user.id, kind=kind, action="deleted")
    return True


async def audit_trail(db: AsyncSession, user: User, limit: int = 50) -> list[dict[str, Any]]:
    """The user's own history. Metadata only, newest first."""
    result = await db.execute(
        select(IdentityAuditLog)
        .where(IdentityAuditLog.user_id == user.id)
        .order_by(IdentityAuditLog.created_at.desc())
        .limit(limit)
    )
    return [
        {
            "kind": row.kind,
            "action": row.action,
            "success": row.success,
            "at": row.created_at,
        }
        for row in result.scalars().all()
    ]
