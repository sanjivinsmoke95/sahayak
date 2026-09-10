"""Normalise and check identity numbers before anything is stored.

Validation is a data-quality control, not a security one — a well-formed
number is still encrypted, still authorised, still audited. Its job is to stop
an OCR misread or a typo becoming a permanent wrong answer at a counter.
"""

from __future__ import annotations

import re

# UIDAI numbers are 12 digits and never begin 0 or 1.
_AADHAAR_RE = re.compile(r"^[2-9]\d{11}$")
# Income Tax PAN: 5 letters, 4 digits, 1 letter.
_PAN_RE = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")
# Fourth character encodes the holder type; anything else is not a real PAN.
_PAN_HOLDER_TYPES = set("ABCFGHLJPTK")

# Verhoeff tables — the checksum UIDAI uses for the twelfth Aadhaar digit.
_D = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9), (1, 2, 3, 4, 0, 6, 7, 8, 9, 5),
    (2, 3, 4, 0, 1, 7, 8, 9, 5, 6), (3, 4, 0, 1, 2, 8, 9, 5, 6, 7),
    (4, 0, 1, 2, 3, 9, 5, 6, 7, 8), (5, 9, 8, 7, 6, 0, 4, 3, 2, 1),
    (6, 5, 9, 8, 7, 1, 0, 4, 3, 2), (7, 6, 5, 9, 8, 2, 1, 0, 4, 3),
    (8, 7, 6, 5, 9, 3, 2, 1, 0, 4), (9, 8, 7, 6, 5, 4, 3, 2, 1, 0),
)
_P = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9), (1, 5, 7, 6, 2, 8, 3, 0, 9, 4),
    (5, 8, 0, 3, 7, 9, 6, 1, 4, 2), (8, 9, 1, 6, 0, 4, 3, 5, 2, 7),
    (9, 4, 5, 3, 1, 2, 6, 8, 7, 0), (4, 2, 8, 6, 5, 7, 3, 9, 0, 1),
    (2, 7, 9, 3, 8, 0, 6, 4, 1, 5), (7, 0, 4, 6, 9, 1, 3, 2, 5, 8),
)


class IdentityValidationError(ValueError):
    """Raised with a message safe to show the reader — it never echoes the input."""


def _verhoeff_ok(digits: str) -> bool:
    check = 0
    for index, char in enumerate(reversed(digits)):
        check = _D[check][_P[index % 8][int(char)]]
    return check == 0


def normalise(kind: str, raw: str) -> str:
    """Strip the spacing people naturally type, and case-fold PAN."""
    collapsed = re.sub(r"[\s\-]", "", raw or "")
    return collapsed.upper() if kind == "pan" else collapsed


def validate(kind: str, raw: str) -> str:
    """Return the canonical value, or raise with a reason that quotes nothing."""
    value = normalise(kind, raw)

    if kind == "aadhaar":
        if not _AADHAAR_RE.match(value):
            raise IdentityValidationError(
                "An Aadhaar number is 12 digits and does not start with 0 or 1."
            )
        if not _verhoeff_ok(value):
            raise IdentityValidationError(
                "That Aadhaar number's check digit does not match. Please re-enter it."
            )
        return value

    if kind == "pan":
        if not _PAN_RE.match(value):
            raise IdentityValidationError(
                "A PAN is five letters, four digits, then one letter — for example ABCDE1234F."
            )
        if value[3] not in _PAN_HOLDER_TYPES:
            raise IdentityValidationError(
                "That PAN's fourth character is not a valid holder type."
            )
        return value

    raise IdentityValidationError("Unknown identity type.")


def mask(kind: str, value: str) -> str:
    """The display form. Safe to store, return and log — it is not the number.

    Aadhaar keeps its last four digits, the convention every Indian utility
    uses. PAN keeps its last digit and holder-type character, which are the
    parts a clerk reads back without identifying the holder on their own.
    """
    if kind == "aadhaar":
        return f"XXXX XXXX {value[-4:]}"
    if kind == "pan":
        return f"XXXXX{value[5:9]}{value[9]}"
    return "XXXX"
