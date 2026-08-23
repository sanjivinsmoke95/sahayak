"""
Field validators & normalisers (Part: VALIDATION + POST PROCESSING).

Each `normalise_*` returns a cleaned value plus a validity flag so the quality
engine can score confidence. `is_*` helpers are cheap booleans. Nothing here
fabricates data — validation only accepts/normalises what is already present.
"""
from __future__ import annotations

import re
from typing import Optional

from utils.domain_filter import is_government_url  # reuse the single authority

# --- Phones (Indian): mobile (10, optional +91/0), landline w/ STD, toll-free ---
_PHONE_CANDIDATE = re.compile(
    r"(?:\+91[\-\s]?|0)?(?:\d[\-\s]?){9,11}\d|1800[\-\s]?\d{2,4}[\-\s]?\d{3,4}"
)
_EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

# Dates: 12/01/2025, 12-01-2025, 12 Jan 2025, January 12, 2025
_MONTHS = ("jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec")
_DATE_NUMERIC = re.compile(r"\b([0-3]?\d)[/\-.]([01]?\d)[/\-.](\d{2,4})\b")
_DATE_TEXT = re.compile(
    r"\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})\b|\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})\b"
)
_CURRENCY = re.compile(r"(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)", re.IGNORECASE)
_FREE = re.compile(r"\b(no fee|free of cost|nil|free)\b", re.IGNORECASE)

_LANGS = {"en", "hi", "te", "ta", "kn", "ml", "mr", "bn", "pa", "gu"}


def is_valid_email(value: str) -> bool:
    return bool(_EMAIL.fullmatch((value or "").strip()))


def valid_phone(value: str) -> bool:
    digits = re.sub(r"\D", "", value or "")
    return 10 <= len(digits) <= 12


def normalise_phone(value: str) -> Optional[str]:
    digits = re.sub(r"\D", "", value or "")
    if not (10 <= len(digits) <= 12):
        return None
    if len(digits) == 10:                       # bare mobile
        return f"+91-{digits}"
    if len(digits) == 11 and digits.startswith("0"):
        return f"0{digits[1:]}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+91-{digits[2:]}"
    return digits


def find_phones(text: str) -> list[str]:
    out, seen = [], set()
    for m in _PHONE_CANDIDATE.findall(text or ""):
        norm = normalise_phone(m)
        if norm and norm not in seen:
            seen.add(norm)
            out.append(norm)
    return out


def find_emails(text: str) -> list[str]:
    out, seen = [], set()
    for e in _EMAIL.findall(text or ""):
        low = e.lower()
        if low not in seen:
            seen.add(low)
            out.append(e)
    return out


def normalise_date(value: str) -> Optional[str]:
    """Return ISO yyyy-mm-dd for a recognised date, else None (Indian dayfirst)."""
    if not value:
        return None
    m = _DATE_NUMERIC.search(value)
    if m:
        d, mth, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        y = y + 2000 if y < 100 else y
        if 1 <= d <= 31 and 1 <= mth <= 12:
            return f"{y:04d}-{mth:02d}-{d:02d}"
    m = _DATE_TEXT.search(value)
    if m:
        if m.group(1):
            d, mon, y = int(m.group(1)), m.group(2)[:3].lower(), int(m.group(3))
        else:
            d, mon, y = int(m.group(5)), m.group(4)[:3].lower(), int(m.group(6))
        if mon in _MONTHS and 1 <= d <= 31:
            return f"{y:04d}-{_MONTHS.index(mon) + 1:02d}-{d:02d}"
    return None


def find_dates(text: str) -> list[str]:
    out, seen = [], set()
    for chunk in re.split(r"[;,\n]", text or ""):
        iso = normalise_date(chunk)
        if iso and iso not in seen:
            seen.add(iso)
            out.append(iso)
    return out


def normalise_fee(value: str) -> Optional[str]:
    """
    Normalise a fee string WITHOUT changing the record's verbatim fee. Returns a
    canonical form like '₹15', '₹1000', or 'Free' — used for quality/analytics.
    """
    if not value:
        return None
    if _FREE.search(value):
        return "Free"
    m = _CURRENCY.search(value)
    if m:
        return "₹" + m.group(1).replace(",", "")
    return None


def looks_like_fee(value: str) -> bool:
    return bool(value) and (bool(_CURRENCY.search(value)) or bool(_FREE.search(value)))


def valid_language(code: str) -> bool:
    return code in _LANGS


def valid_gov_url(url: str) -> bool:
    return is_government_url(url or "")
