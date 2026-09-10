"""Dedicated, authenticated endpoints for a user's own identity numbers.

Kept off `/profiles`, `/users` and `/settings` on purpose: those responses are
broad and easy to extend carelessly, and nothing there should ever be able to
grow an Aadhaar field. Everything below derives the owner from the Clerk
session via `get_current_user`; no route accepts a user id.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.identity import (
    IdentityAuditEntry,
    IdentityKind,
    IdentityRead,
    IdentityRevealResponse,
    IdentityUpsert,
)
from app.services import identity_service as identity
from app.services.identity_crypto import (
    IdentityCryptoUnavailable,
    IdentityDecryptionError,
    crypto_available,
)
from app.services.identity_validation import IdentityValidationError

router = APIRouter(prefix="/identity", tags=["identity"])

# Identity responses must not sit in a shared cache or a browser's back/forward
# store, so every route below sets these.
_NO_STORE = {
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Pragma": "no-cache",
}


def _require_crypto() -> None:
    """Fail closed. Without keys the feature is unavailable, never plaintext."""
    if not crypto_available():
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Secure identity storage is not configured on this server.",
        )


@router.get("", response_model=list[IdentityRead])
async def list_identities(
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    """Masked values only — this route never decrypts anything."""
    response.headers.update(_NO_STORE)
    return await identity.list_masked(db, user)


@router.put("/{kind}", response_model=IdentityRead)
async def put_identity(
    kind: IdentityKind,
    payload: IdentityUpsert,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    _require_crypto()
    response.headers.update(_NO_STORE)
    try:
        return await identity.upsert(db, user, kind, payload.value)
    except IdentityValidationError as exc:
        # The validator's messages describe the expected format and never quote
        # what was submitted, so this is safe to return verbatim.
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    except IdentityCryptoUnavailable as exc:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Secure identity storage is not configured on this server.",
        ) from exc


@router.post("/{kind}/reveal", response_model=IdentityRevealResponse)
async def reveal_identity(
    kind: IdentityKind,
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Return the plaintext once, to its owner, and write an audit row.

    POST rather than GET so the action cannot be triggered by a link, prefetch
    or image tag, and so it never lands in browser history or a proxy log.
    """
    _require_crypto()
    response.headers.update(_NO_STORE)
    try:
        value = await identity.reveal(db, user, kind)
    except LookupError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such record.") from exc
    except (IdentityDecryptionError, IdentityCryptoUnavailable) as exc:
        # The underlying reason is useful server-side and useless — possibly
        # harmful — to a caller, so it is logged upstream and generalised here.
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "This record could not be opened. Please contact support.",
        ) from exc
    return {"kind": kind, "value": value}


@router.delete("/{kind}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_identity(
    kind: IdentityKind,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    if not await identity.delete(db, user, kind):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such record.")


@router.get("/audit", response_model=list[IdentityAuditEntry])
async def read_audit(
    response: Response,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    response.headers.update(_NO_STORE)
    return await identity.audit_trail(db, user)
