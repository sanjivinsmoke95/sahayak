"""
Clerk session verification.

The frontend sends the Clerk session JWT as a bearer token. We verify it
against Clerk's JWKS, cached in memory, and mirror the user into our own
table on first sight so foreign keys have something to point at.

With CLERK_ISSUER unset the whole thing short-circuits to a development
user, so a fresh clone runs before anyone has opened a Clerk account.
"""

import time
from typing import Any

import httpx
from fastapi import Depends, Header, HTTPException, status
from jose import jwt
from jose.exceptions import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Setting, User

_JWKS_CACHE: dict[str, Any] = {"keys": None, "fetched_at": 0.0}
_JWKS_TTL_SECONDS = 3600

DEV_CLERK_ID = "dev-user"


async def _get_jwks() -> dict[str, Any]:
    now = time.time()
    if _JWKS_CACHE["keys"] and now - _JWKS_CACHE["fetched_at"] < _JWKS_TTL_SECONDS:
        return _JWKS_CACHE["keys"]

    url = f"{settings.clerk_issuer.rstrip('/')}/.well-known/jwks.json"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url)
        response.raise_for_status()
        keys = response.json()

    _JWKS_CACHE.update(keys=keys, fetched_at=now)
    return keys


async def _verify_token(token: str) -> dict[str, Any]:
    try:
        jwks = await _get_jwks()
        header = jwt.get_unverified_header(token)
        key = next((k for k in jwks.get("keys", []) if k["kid"] == header.get("kid")), None)
        if key is None:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unknown signing key")

        return jwt.decode(
            token,
            key,
            algorithms=[header.get("alg", "RS256")],
            issuer=settings.clerk_issuer,
            audience=settings.clerk_audience or None,
            options={"verify_aud": bool(settings.clerk_audience)},
        )
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session token") from exc


async def _get_or_create_user(db: AsyncSession, clerk_id: str, email: str | None) -> User:
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(clerk_id=clerk_id, email=email)
    db.add(user)
    await db.flush()
    db.add(Setting(user_id=user.id))
    await db.flush()
    return user


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """The dependency every protected route uses."""

    if not settings.auth_enabled:
        return await _get_or_create_user(db, DEV_CLERK_ID, "dev@localhost")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    claims = await _verify_token(authorization.split(" ", 1)[1])
    clerk_id = claims.get("sub")
    if not clerk_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token has no subject")

    return await _get_or_create_user(db, clerk_id, claims.get("email"))
