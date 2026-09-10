"""Security tests for the encrypted identity store.

These follow the suite's existing style: router functions are called directly
with a stand-in session, which is what lets a cross-user attempt be expressed
honestly — the fake session returns whatever is asked for, so anything that
still fails is failing on the application's own authorisation, not on a
convenient mock.
"""

from __future__ import annotations

import logging
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.routers import identity as identity_router
from app.schemas.identity import IdentityRead, IdentityRevealResponse
from app.services import identity_service as svc
from app.services.identity_crypto import (
    IdentityDecryptionError,
    binding,
    generate_key,
    seal,
    unseal,
)
from app.services.identity_validation import IdentityValidationError, mask, validate
from app.utils.logging import RedactingFilter, scrub

VALID_PAN = "ABCPE1234F"
VALID_AADHAAR = "234567890124"  # Verhoeff-valid


@pytest.fixture(autouse=True)
def _keys(monkeypatch):
    """A throwaway keyring, so tests never depend on a deployment's real keys."""
    monkeypatch.setenv("IDENTITY_ENCRYPTION_KEYS", f"v1:{generate_key()},v2:{generate_key()}")
    monkeypatch.setenv("IDENTITY_ENCRYPTION_ACTIVE_VERSION", "v2")


class FakeSession:
    """Records what the application asked to persist, and answers queries."""

    def __init__(self, row=None) -> None:
        self.row = row
        self.added: list[object] = []
        self.deleted: list[object] = []

    async def execute(self, _statement):
        row = self.row
        return SimpleNamespace(
            scalar_one_or_none=lambda: row,
            scalars=lambda: SimpleNamespace(all=lambda: [row] if row else []),
        )

    def add(self, obj) -> None:
        self.added.append(obj)

    async def delete(self, obj) -> None:
        self.deleted.append(obj)

    async def flush(self) -> None:
        return None


def make_user(user_id: str = "user-1"):
    return SimpleNamespace(id=user_id)


def make_row(user, kind: str, value: str, key_version: str = "v2"):
    sealed = seal(value, aad=binding(user.id, kind))
    return SimpleNamespace(
        user_id=user.id,
        kind=kind,
        ciphertext=sealed.ciphertext,
        key_version=sealed.key_version,
        masked=mask(kind, value),
        updated_at=None,
    )


# --------------------------------------------------------------------------
# Encryption correctness
# --------------------------------------------------------------------------

def test_encrypt_then_decrypt_round_trips() -> None:
    aad = binding("user-1", "pan")
    sealed = seal(VALID_PAN, aad=aad)
    assert unseal(sealed.ciphertext, sealed.key_version, aad=aad) == VALID_PAN


def test_ciphertext_never_contains_the_plaintext() -> None:
    sealed = seal(VALID_AADHAAR, aad=binding("user-1", "aadhaar"))
    assert VALID_AADHAAR not in sealed.ciphertext
    assert VALID_AADHAAR[-4:] not in sealed.ciphertext


def test_same_value_seals_differently_each_time() -> None:
    """A fresh nonce per write, so equal numbers are not equal ciphertexts."""
    aad = binding("user-1", "pan")
    assert seal(VALID_PAN, aad=aad).ciphertext != seal(VALID_PAN, aad=aad).ciphertext


def test_active_version_is_recorded_for_rotation() -> None:
    assert seal(VALID_PAN, aad=binding("user-1", "pan")).key_version == "v2"


def test_value_sealed_under_an_older_key_still_opens(monkeypatch) -> None:
    """Rotation must not strand rows written under the previous key."""
    aad = binding("user-1", "pan")
    monkeypatch.setenv("IDENTITY_ENCRYPTION_ACTIVE_VERSION", "v1")
    old = seal(VALID_PAN, aad=aad)
    monkeypatch.setenv("IDENTITY_ENCRYPTION_ACTIVE_VERSION", "v2")
    assert old.key_version == "v1"
    assert unseal(old.ciphertext, old.key_version, aad=aad) == VALID_PAN


def test_ciphertext_moved_to_another_user_fails_to_decrypt() -> None:
    """The owner binding makes a row lifted between accounts undecryptable."""
    sealed = seal(VALID_PAN, aad=binding("victim", "pan"))
    with pytest.raises(IdentityDecryptionError):
        unseal(sealed.ciphertext, sealed.key_version, aad=binding("attacker", "pan"))


def test_ciphertext_reused_for_another_field_fails_to_decrypt() -> None:
    sealed = seal(VALID_PAN, aad=binding("user-1", "pan"))
    with pytest.raises(IdentityDecryptionError):
        unseal(sealed.ciphertext, sealed.key_version, aad=binding("user-1", "aadhaar"))


def test_tampered_ciphertext_is_rejected_not_returned() -> None:
    aad = binding("user-1", "pan")
    sealed = seal(VALID_PAN, aad=aad)
    flipped = ("B" if sealed.ciphertext[20] != "B" else "C")
    tampered = sealed.ciphertext[:20] + flipped + sealed.ciphertext[21:]
    with pytest.raises(IdentityDecryptionError):
        unseal(tampered, sealed.key_version, aad=aad)


# --------------------------------------------------------------------------
# Authorisation / IDOR
# --------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_reveal_is_scoped_to_the_authenticated_user() -> None:
    """The victim's row is in the session, but the binding is rebuilt from the
    caller's identity — so an attacker reaching it gets an error, not a number."""
    victim, attacker = make_user("victim"), make_user("attacker")
    db = FakeSession(row=make_row(victim, "pan", VALID_PAN))

    with pytest.raises(IdentityDecryptionError):
        await svc.reveal(db, attacker, "pan")

    assert await svc.reveal(db, victim, "pan") == VALID_PAN


@pytest.mark.asyncio
async def test_reveal_endpoint_returns_generic_error_on_cross_user_attempt() -> None:
    """The route must not leak why it failed, nor any part of the value."""
    victim, attacker = make_user("victim"), make_user("attacker")
    db = FakeSession(row=make_row(victim, "pan", VALID_PAN))

    with pytest.raises(HTTPException) as error:
        await identity_router.reveal_identity(
            "pan", SimpleNamespace(headers={}), db=db, user=attacker
        )

    assert error.value.status_code == 503
    assert VALID_PAN not in str(error.value.detail)


def test_every_service_entry_point_takes_the_user_object() -> None:
    """Owner identity must arrive as the authenticated User, never as a bare id
    a caller could choose. A signature taking `user_id: str` would be the shape
    of a BOLA waiting to happen."""
    import inspect

    for name in ("get_row", "list_masked", "upsert", "reveal", "delete", "audit_trail"):
        params = list(inspect.signature(getattr(svc, name)).parameters)
        assert params[:2] == ["db", "user"], f"{name} takes {params}"


def test_no_identity_route_accepts_a_user_id_parameter() -> None:
    """Structural guard against a future BOLA: an id in the path or body would
    be the first step towards trusting the client's word for who they are."""
    import inspect

    for name in ("list_identities", "put_identity", "reveal_identity", "delete_identity"):
        params = inspect.signature(getattr(identity_router, name)).parameters
        assert not any("user_id" in p or p == "owner" for p in params), name


# --------------------------------------------------------------------------
# Response shape — no plaintext leakage
# --------------------------------------------------------------------------

def test_read_model_cannot_express_a_plaintext_value() -> None:
    """Even if a route tried, the default response model has nowhere to put it."""
    assert "value" not in IdentityRead.model_fields
    assert set(IdentityRead.model_fields) == {"kind", "masked", "updatedAt"}


def test_only_the_reveal_model_carries_a_value() -> None:
    assert "value" in IdentityRevealResponse.model_fields


@pytest.mark.asyncio
async def test_listing_returns_masked_values_only() -> None:
    user = make_user()
    db = FakeSession(row=make_row(user, "aadhaar", VALID_AADHAAR))
    rows = await svc.list_masked(db, user)
    assert rows[0]["masked"] == "XXXX XXXX 0124"
    assert VALID_AADHAAR not in str(rows)


@pytest.mark.asyncio
async def test_saving_returns_only_the_mask() -> None:
    user = make_user()
    db = FakeSession()
    result = await svc.upsert(db, user, "pan", VALID_PAN)
    assert result == {"kind": "pan", "masked": "XXXXX1234F", "updatedAt": None}
    assert VALID_PAN not in str(result)


@pytest.mark.asyncio
async def test_stored_row_holds_ciphertext_not_the_number() -> None:
    db = FakeSession()
    await svc.upsert(db, make_user(), "aadhaar", VALID_AADHAAR)
    row = next(r for r in db.added if getattr(r, "kind", None) == "aadhaar")
    assert VALID_AADHAAR not in row.ciphertext
    assert row.masked == "XXXX XXXX 0124"


# --------------------------------------------------------------------------
# Masking
# --------------------------------------------------------------------------

def test_masks_match_the_documented_format() -> None:
    assert mask("aadhaar", VALID_AADHAAR) == "XXXX XXXX 0124"
    assert mask("pan", VALID_PAN) == "XXXXX1234F"


def test_mask_reveals_no_more_than_four_characters() -> None:
    assert sum(c.isdigit() for c in mask("aadhaar", VALID_AADHAAR)) == 4


# --------------------------------------------------------------------------
# Input validation
# --------------------------------------------------------------------------

@pytest.mark.parametrize(
    "kind,value",
    [
        ("aadhaar", "1234 5678 9012"),   # starts with 1
        ("aadhaar", "0234 5678 9012"),   # starts with 0
        ("aadhaar", "23456789012"),      # 11 digits
        ("aadhaar", "2345678901234"),    # 13 digits
        ("aadhaar", "234567890123"),     # bad Verhoeff check digit
        ("aadhaar", "abcd efgh ijkl"),   # not digits
        ("pan", "ABCD1234F"),            # too short
        ("pan", "ABCDE12345"),           # ends with a digit
        ("pan", "ABCZE1234F"),           # invalid holder type in 4th position
        ("pan", "12345ABCDE"),           # shape inverted
        ("pan", ""),
    ],
)
def test_invalid_values_are_rejected(kind: str, value: str) -> None:
    with pytest.raises(IdentityValidationError):
        validate(kind, value)


def test_validation_errors_never_echo_the_submitted_value() -> None:
    """An error message is the easiest place for a number to escape into a log."""
    try:
        validate("aadhaar", "1234 5678 9012")
    except IdentityValidationError as exc:
        assert "1234" not in str(exc) and "5678" not in str(exc)


def test_input_is_normalised_before_storage() -> None:
    assert validate("aadhaar", " 2345-6789 0124 ") == VALID_AADHAAR
    assert validate("pan", " abcpe1234f ") == VALID_PAN


def test_unknown_kind_is_rejected() -> None:
    with pytest.raises(IdentityValidationError):
        validate("passport", "X1234567")


# --------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------

def test_scrub_removes_identity_numbers() -> None:
    assert VALID_AADHAAR not in scrub(f"processing {VALID_AADHAAR} now")
    assert VALID_PAN not in scrub(f"pan={VALID_PAN}")
    assert "2345 6789 0124" not in scrub("aadhaar 2345 6789 0124")


def test_scrub_removes_tokens_and_keys() -> None:
    assert "eyJhbGciOiJSUzI1NiIsImtpZCI6" not in scrub(
        "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6abcdefgh"
    )
    assert "hunter2" not in scrub("password=hunter2")


def test_log_filter_scrubs_message_and_arguments() -> None:
    filt = RedactingFilter()
    record = logging.LogRecord(
        "t", logging.INFO, __file__, 1, "value %s for %s", (VALID_AADHAAR, VALID_PAN), None
    )
    filt.filter(record)
    assert VALID_AADHAAR not in record.getMessage()
    assert VALID_PAN not in record.getMessage()


@pytest.mark.asyncio
async def test_audit_rows_contain_metadata_only() -> None:
    db = FakeSession()
    await svc.record_audit(
        db, owner_id="user-1", actor_id="user-1", kind="pan", action="viewed"
    )
    entry = db.added[0]
    assert entry.action == "viewed" and entry.user_id == "user-1"
    assert not hasattr(entry, "value") and not hasattr(entry, "ciphertext")


@pytest.mark.asyncio
async def test_reveal_writes_an_audit_row_without_the_value() -> None:
    user = make_user()
    db = FakeSession(row=make_row(user, "pan", VALID_PAN))
    await svc.reveal(db, user, "pan")
    audit = [a for a in db.added if getattr(a, "action", None) == "viewed"]
    assert len(audit) == 1
    assert VALID_PAN not in str(vars(audit[0]))


@pytest.mark.asyncio
async def test_failed_reveal_is_audited_as_a_failure() -> None:
    db = FakeSession(row=None)
    with pytest.raises(LookupError):
        await svc.reveal(db, make_user(), "pan")
    entry = db.added[0]
    assert entry.action == "viewed" and entry.success is False
    assert entry.detail == "not_found"


# --------------------------------------------------------------------------
# Deletion
# --------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_delete_removes_the_row_and_audits() -> None:
    user = make_user()
    row = make_row(user, "pan", VALID_PAN)
    db = FakeSession(row=row)
    assert await svc.delete(db, user, "pan") is True
    assert db.deleted == [row]
    assert any(getattr(a, "action", None) == "deleted" for a in db.added)


@pytest.mark.asyncio
async def test_delete_of_a_missing_record_reports_false() -> None:
    assert await svc.delete(FakeSession(row=None), make_user(), "pan") is False


# --------------------------------------------------------------------------
# Fail-closed behaviour
# --------------------------------------------------------------------------

def test_feature_is_unavailable_without_keys(monkeypatch) -> None:
    """No keys must mean no feature — never a silent plaintext fallback."""
    monkeypatch.delenv("IDENTITY_ENCRYPTION_KEYS", raising=False)
    monkeypatch.setattr(
        "app.services.identity_crypto.settings",
        SimpleNamespace(identity_encryption_keys="", identity_encryption_active_version=""),
    )
    with pytest.raises(HTTPException) as error:
        identity_router._require_crypto()
    assert error.value.status_code == 503


def test_ocr_extraction_masks_sensitive_fields() -> None:
    """The document pipeline must not put a full number on the wire."""
    from app.services.personal_details import extract_personal, redact_pii

    text = f"Permanent Account Number Card\nPAN: {VALID_PAN}\nAadhaar 2345 6789 0124\n"
    fields = extract_personal(text)
    rendered = str(fields)
    assert VALID_PAN not in rendered
    assert "2345 6789 0124" not in rendered
    assert any(f["sensitive"] for f in fields)

    redacted = redact_pii(text)
    assert VALID_PAN not in redacted and "2345 6789 0124" not in redacted
