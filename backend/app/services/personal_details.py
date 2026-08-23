"""
Read structured personal fields out of a document's extracted text.

This turns raw OCR into a small set of labelled fields the reader can trust —
name, date of birth, PAN, Aadhaar, and the reference numbers a counter asks
for. It is deliberately conservative: a field is only emitted when a pattern
matches with reasonable confidence, because a wrong "your PAN is…" is worse
than a missing one. Sensitive identifiers are flagged so the UI can mask them,
and no value is ever logged.
"""

import re
from typing import Any

Localized = dict[str, str]


def _loc(en: str, hi: str, te: str) -> Localized:
    return {"en": en, "hi": hi, "te": te}


# Labels whose following value we never treat as a person's name.
_NAME_STOPWORDS = (
    "department",
    "government",
    "income",
    "tax",
    "permanent",
    "account",
    "number",
    "card",
    "india",
    "signature",
)

_PAN_RE = re.compile(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b")
_AADHAAR_RE = re.compile(r"\b(\d{4}\s\d{4}\s\d{4})\b")
_DATE = r"([0-3]?\d[/\-.][01]?\d[/\-.]\d{2,4})"


def _looks_like_name(value: str) -> bool:
    if not value or len(value) < 3 or len(value) > 60:
        return False
    lowered = value.lower()
    if any(word in lowered for word in _NAME_STOPWORDS):
        return False
    words = value.split()
    if not (1 < len(words) <= 5):
        return False
    # Mostly letters (allow spaces and dots for initials).
    letters = sum(ch.isalpha() or ch in " ." for ch in value)
    return letters / len(value) > 0.85


def _value_after_label(lines: list[str], label_patterns: tuple[str, ...]) -> str | None:
    """Find a label line, return the labelled value (inline or on the next line)."""
    for index, line in enumerate(lines):
        for pattern in label_patterns:
            match = re.search(pattern, line, flags=re.IGNORECASE)
            if not match:
                continue
            # Value printed after the label on the same line. When the label
            # runs into more words before a colon ("Name of Pensioner: X"),
            # keep only what follows the colon.
            inline = line[match.end() :]
            if ":" in inline:
                inline = inline.rsplit(":", 1)[-1]
            inline = inline.strip(" :\t-")
            if inline:
                return inline
            # Otherwise the value is usually the next non-empty line.
            for nxt in lines[index + 1 : index + 3]:
                if nxt.strip():
                    return nxt.strip()
    return None


def extract_personal(raw_text: str | None) -> list[dict[str, Any]]:
    """Return a list of {label: Localized, value: str, sensitive: bool}."""
    if not raw_text:
        return []

    text = raw_text
    lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]
    fields: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()

    def add(label: Localized, value: str | None, sensitive: bool) -> None:
        if not value:
            return
        value = value.strip(" :\t-.,")
        if not value:
            return
        key = (label["en"], value)
        if key in seen:
            return
        seen.add(key)
        fields.append({"label": label, "value": value, "sensitive": sensitive})

    # Name / relations — label driven, and only when it reads like a name.
    father = _value_after_label(lines, (r"father'?s?\s*name", r"पिता", r"తండ్రి"))
    if father and _looks_like_name(father):
        add(_loc("Father's name", "पिता का नाम", "తండ్రి పేరు"), father, False)

    mother = _value_after_label(lines, (r"mother'?s?\s*name", r"माता", r"తల్లి"))
    if mother and _looks_like_name(mother):
        add(_loc("Mother's name", "माता का नाम", "తల్లి పేరు"), mother, False)

    name = _value_after_label(lines, (r"\bname\b", r"\bनाम\b", r"పేరు"))
    if name and _looks_like_name(name):
        add(_loc("Name", "नाम", "పేరు"), name, False)

    # Date of birth.
    dob = re.search(
        r"(?:date of birth|d\.?o\.?b|जन्म\s*तिथि|जन्म|పుట్టిన\s*తేదీ)[:\s]*" + _DATE,
        text,
        flags=re.IGNORECASE,
    )
    if dob:
        add(_loc("Date of birth", "जन्म तिथि", "పుట్టిన తేదీ"), dob.group(1), False)

    # Identifiers.
    pan = _PAN_RE.search(text)
    if pan:
        add(_loc("PAN number", "पैन नंबर", "పాన్ నంబర్"), pan.group(1), True)

    aadhaar = _AADHAAR_RE.search(text)
    if aadhaar:
        add(_loc("Aadhaar number", "आधार नंबर", "ఆధార్ నంబర్"), aadhaar.group(1), True)

    for patterns, label, sensitive in (
        (
            (r"application\s*(?:no|number|id)", r"आवेदन\s*संख्या", r"దరఖాస్తు"),
            _loc("Application number", "आवेदन संख्या", "దరఖాస్తు నంబర్"),
            False,
        ),
        (
            (r"certificate\s*(?:no|number)", r"प्रमाणपत्र\s*संख्या", r"ధృవీకరణ"),
            _loc("Certificate number", "प्रमाणपत्र संख्या", "ధృవీకరణ నంబర్"),
            False,
        ),
        (
            (r"(?:ppo|pension\s*(?:order|payment order)?)\s*(?:no|number)", r"पेंशन\s*संख्या"),
            _loc("Pension order number", "पेंशन आदेश संख्या", "పింఛను ఆర్డర్ నంబర్"),
            False,
        ),
        (
            (r"account\s*(?:no|number)", r"खाता\s*संख्या", r"ఖాతా"),
            _loc("Account number", "खाता संख्या", "ఖాతా నంబర్"),
            True,
        ),
    ):
        value = _value_after_label(lines, patterns)
        if value:
            # Keep only the identifier-looking token, and require a digit so a
            # label embedded in prose ("Permanent Account Number Card") cannot
            # be mistaken for a real number.
            token = re.search(r"[A-Za-z0-9/\-]*\d[A-Za-z0-9/\-]*", value)
            if token and len(token.group(0)) >= 4:
                add(label, token.group(0), sensitive)

    return fields
