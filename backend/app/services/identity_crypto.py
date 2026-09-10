"""Authenticated encryption for identity numbers (Aadhaar, PAN).

AES-256-GCM, with the key material held only in the environment. Two details
matter beyond the cipher choice:

* **Key version travels with the ciphertext.** Rows record which key sealed
  them, so a new key can be introduced and old rows re-sealed in the
  background without a flag day.
* **Every ciphertext is bound to its owner.** The user id and field name are
  passed as additional authenticated data, so a row lifted from one user and
  pasted onto another fails to decrypt rather than silently revealing the
  wrong person's number.

Nothing here logs, formats, or raises with plaintext or key material in it.
"""

from __future__ import annotations

import base64
import os
from dataclasses import dataclass

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import settings

_KEY_BYTES = 32  # AES-256
_NONCE_BYTES = 12  # GCM standard

# "v1:<base64 32-byte key>,v2:<base64 32-byte key>"
_KEYS_ENV = "IDENTITY_ENCRYPTION_KEYS"
# Which of the above seals new writes, e.g. "v2".
_ACTIVE_ENV = "IDENTITY_ENCRYPTION_ACTIVE_VERSION"


class IdentityCryptoUnavailable(RuntimeError):
    """No usable key material is configured, so the feature must stay closed."""


class IdentityDecryptionError(RuntimeError):
    """The ciphertext did not authenticate under the key and binding given."""


@dataclass(frozen=True)
class Sealed:
    """A stored secret: opaque bytes plus the key version that produced them."""

    ciphertext: str
    key_version: str


def _parse_keys(raw: str) -> dict[str, bytes]:
    keys: dict[str, bytes] = {}
    for entry in raw.split(","):
        entry = entry.strip()
        if not entry or ":" not in entry:
            continue
        version, _, encoded = entry.partition(":")
        version = version.strip()
        try:
            key = base64.b64decode(encoded.strip(), validate=True)
        except (ValueError, TypeError) as exc:
            # Deliberately does not echo the value being parsed.
            raise IdentityCryptoUnavailable(
                f"Key '{version}' in {_KEYS_ENV} is not valid base64."
            ) from exc
        if len(key) != _KEY_BYTES:
            raise IdentityCryptoUnavailable(
                f"Key '{version}' in {_KEYS_ENV} must decode to {_KEY_BYTES} bytes."
            )
        keys[version] = key
    return keys


def _keyring() -> tuple[dict[str, bytes], str]:
    """Resolve the current keyring.

    A real process environment wins, so a deployment can inject keys from a
    secret manager and rotate them without a rebuild; the settings object is
    the fallback that gives local development the project's usual .env file.
    Read on each call rather than cached, so an injected rotation takes effect
    without a restart.
    """
    keys = _parse_keys(os.getenv(_KEYS_ENV) or settings.identity_encryption_keys)
    if not keys:
        raise IdentityCryptoUnavailable(
            f"{_KEYS_ENV} is not set. Identity storage stays disabled until it is."
        )
    active = (
        os.getenv(_ACTIVE_ENV) or settings.identity_encryption_active_version or ""
    ).strip() or max(keys)
    if active not in keys:
        raise IdentityCryptoUnavailable(
            f"{_ACTIVE_ENV} names '{active}', which is not present in {_KEYS_ENV}."
        )
    return keys, active


def crypto_available() -> bool:
    """Whether the feature can operate, for startup checks and health output."""
    try:
        _keyring()
    except IdentityCryptoUnavailable:
        return False
    return True


def binding(user_id: str, kind: str) -> bytes:
    """The additional authenticated data tying a ciphertext to one user+field."""
    return f"sahayak:identity:v1:{user_id}:{kind}".encode()


def seal(plaintext: str, *, aad: bytes) -> Sealed:
    keys, active = _keyring()
    nonce = os.urandom(_NONCE_BYTES)
    blob = AESGCM(keys[active]).encrypt(nonce, plaintext.encode(), aad)
    return Sealed(base64.b64encode(nonce + blob).decode(), active)


def unseal(ciphertext: str, key_version: str, *, aad: bytes) -> str:
    keys, _ = _keyring()
    key = keys.get(key_version)
    if key is None:
        raise IdentityDecryptionError(
            f"Stored value was sealed with key '{key_version}', which is not configured."
        )
    try:
        raw = base64.b64decode(ciphertext, validate=True)
        return AESGCM(key).decrypt(raw[:_NONCE_BYTES], raw[_NONCE_BYTES:], aad).decode()
    except (InvalidTag, ValueError, TypeError) as exc:
        # The message never carries ciphertext, key, or plaintext.
        raise IdentityDecryptionError("Stored value failed authentication.") from exc


def generate_key() -> str:
    """A fresh base64 key, for operators setting up or rotating."""
    return base64.b64encode(os.urandom(_KEY_BYTES)).decode()
