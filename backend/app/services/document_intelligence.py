"""
The intelligence layer: what the reader actually needs to know before applying.

Everything here is deterministic and derived on read from a document's already
stored OCR text and classification — no new tables, no invented facts. When a
date or a validity period cannot be found, the result says so ("unknown")
rather than guessing, in keeping with the product's grounding rules.
"""

from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any

from app.services.classification import classify_document
from app.services.personal_details import extract_personal
from app.services.service_catalog import get_service

# ----------------------------------------------------------------------------
# Dates
# ----------------------------------------------------------------------------

_MONTHS = {
    m: i
    for i, m in enumerate(
        [
            "jan", "feb", "mar", "apr", "may", "jun",
            "jul", "aug", "sep", "oct", "nov", "dec",
        ],
        start=1,
    )
}

# "21 May 2025", "21 May, 2025", "21-May-2025"
_TEXT_DATE = re.compile(
    r"\b([0-3]?\d)[\s\-]+([A-Za-z]{3,9})[\s,\-]+((?:19|20)\d{2})\b"
)
# 21/05/2025, 21-05-2025, 21.05.2025
_NUM_DATE = re.compile(r"\b([0-3]?\d)[/\-.]([01]?\d)[/\-.]((?:19|20)?\d{2})\b")
# 2025-05-21
_ISO_DATE = re.compile(r"\b((?:19|20)\d{2})-([01]?\d)-([0-3]?\d)\b")


def _parse_date_text(text: str) -> date | None:
    """Best-effort parse of the first date-like token in `text`."""
    m = _TEXT_DATE.search(text)
    if m:
        day, mon, year = m.group(1), m.group(2)[:3].lower(), m.group(3)
        if mon in _MONTHS:
            try:
                return date(int(year), _MONTHS[mon], int(day))
            except ValueError:
                return None
    m = _ISO_DATE.search(text)
    if m:
        try:
            return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return None
    m = _NUM_DATE.search(text)
    if m:
        day, mon, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if year < 100:
            year += 2000
        try:
            return date(year, mon, day)
        except ValueError:
            return None
    return None


def _add_months(start: date, months: int) -> date:
    month_index = start.month - 1 + months
    year = start.year + month_index // 12
    month = month_index % 12 + 1
    # Clamp the day to the target month's length.
    day = min(start.day, [31, 29 if year % 4 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)


# ----------------------------------------------------------------------------
# Validity
# ----------------------------------------------------------------------------

_ISSUE_LABEL = re.compile(
    r"(?:date of issue|issued on|issue date|date\s*:)\s*([^\n,;]{0,24})", re.IGNORECASE
)
_EXPIRY_LABEL = re.compile(
    r"(?:valid\s*(?:up\s*to|upto|until|till)|date of expiry|expiry date|expires? on|valid till)\s*[:\-]?\s*([^\n,;]{0,24})",
    re.IGNORECASE,
)
_VALID_FOR = re.compile(
    r"valid for\s*(\d{1,2})\s*(day|days|month|months|year|years)", re.IGNORECASE
)
_EXPIRING_WINDOW_DAYS = 30


def extract_validity(raw_text: str | None, today: date | None = None) -> dict[str, Any]:
    """Return the document's validity: issue/expiry dates and a status."""
    today = today or date.today()
    text = raw_text or ""

    issue_date: date | None = None
    issue_match = _ISSUE_LABEL.search(text)
    if issue_match:
        issue_date = _parse_date_text(issue_match.group(1))

    expiry_date: date | None = None
    expiry_match = _EXPIRY_LABEL.search(text)
    if expiry_match:
        expiry_date = _parse_date_text(expiry_match.group(1))

    # "valid for N months/years" from the issue date.
    if expiry_date is None and issue_date is not None:
        vf = _VALID_FOR.search(text)
        if vf:
            n, unit = int(vf.group(1)), vf.group(2).lower()
            if unit.startswith("day"):
                from datetime import timedelta

                expiry_date = issue_date + timedelta(days=n)
            elif unit.startswith("month"):
                expiry_date = _add_months(issue_date, n)
            elif unit.startswith("year"):
                expiry_date = _add_months(issue_date, n * 12)

    if expiry_date is None:
        return {
            "issueDate": issue_date.isoformat() if issue_date else None,
            "expiryDate": None,
            "status": "unknown",
            "daysLeft": None,
            "source": "document" if issue_date else "none",
            "confidence": 0.4 if issue_date else 0.2,
        }

    days_left = (expiry_date - today).days
    if days_left < 0:
        status = "expired"
    elif days_left <= _EXPIRING_WINDOW_DAYS:
        status = "expiring"
    else:
        status = "valid"

    return {
        "issueDate": issue_date.isoformat() if issue_date else None,
        "expiryDate": expiry_date.isoformat(),
        "status": status,
        "daysLeft": days_left,
        "source": "document",
        "confidence": 0.8,
    }


# ----------------------------------------------------------------------------
# Identity profile + consistency
# ----------------------------------------------------------------------------

_TITLES = re.compile(r"^(mr|mrs|ms|smt|sri|shri|kum|dr)\.?\s+", re.IGNORECASE)


def _normalize_name(value: str) -> str:
    value = _TITLES.sub("", value.strip())
    value = re.sub(r"[^a-zA-Z\s]", "", value)
    return re.sub(r"\s+", " ", value).strip().lower()


def identity_profile(raw_text: str | None) -> dict[str, str]:
    """Normalized personal fields for cross-document comparison."""
    profile: dict[str, str] = {}
    for field in extract_personal(raw_text):
        label = field["label"]["en"]
        value = field["value"]
        if label == "Name":
            profile["name"] = value
        elif label == "Date of birth":
            parsed = _parse_date_text(value)
            if parsed:
                profile["dob"] = parsed.isoformat()
        elif label == "Father's name":
            profile["father"] = value
    return profile


def find_consistency_issues(documents: list[Any]) -> list[dict[str, Any]]:
    """
    Compare personal fields across the user's documents and surface potential
    mismatches. A mismatch is a prompt to double-check, never a verdict that a
    document is invalid.
    """
    profiles: list[tuple[str, str, dict[str, str]]] = []
    for doc in documents:
        if not getattr(doc, "raw_text", None):
            continue
        profile = identity_profile(doc.raw_text)
        if profile:
            title = (doc.title or {}).get("en") if isinstance(doc.title, dict) else None
            profiles.append((doc.slug, title or doc.slug, profile))

    issues: list[dict[str, Any]] = []

    def pair_matches(field: str, same: bool) -> None:
        for i in range(len(profiles)):
            for j in range(i + 1, len(profiles)):
                a, b = profiles[i], profiles[j]
                va, vb = a[2].get(field), b[2].get(field)
                if not va or not vb:
                    continue
                if field == "name":
                    na, nb = _normalize_name(va), _normalize_name(vb)
                    if na == nb:
                        continue
                    # Only flag likely-same-person variants (share a name token).
                    if not (set(na.split()) & set(nb.split())):
                        continue
                    issues.append(
                        {
                            "type": "name_mismatch",
                            "severity": "warning",
                            "documents": [a[0], b[0]],
                            "documentTitles": [a[1], b[1]],
                            "values": [va, vb],
                            "field": "name",
                        }
                    )
                elif field == "dob":
                    if va == vb:
                        continue
                    issues.append(
                        {
                            "type": "dob_mismatch",
                            "severity": "high",
                            "documents": [a[0], b[0]],
                            "documentTitles": [a[1], b[1]],
                            "values": [va, vb],
                            "field": "dob",
                        }
                    )

    pair_matches("name", same=True)
    pair_matches("dob", same=True)
    return issues


# ----------------------------------------------------------------------------
# Readiness + usable-for
# ----------------------------------------------------------------------------


def _doc_tags(doc: Any) -> set[str]:
    if getattr(doc, "is_sample", False) or not getattr(doc, "raw_text", None):
        return set()
    result = classify_document(doc.raw_text)
    if not result["isGovernment"]:
        return set()
    tags = set(result["tags"])
    if result["docType"]:
        tags.add(result["docType"].lower())
    return tags


def _match_document(requirement_tags: list[str], documents: list[Any]) -> Any | None:
    if not requirement_tags:
        return None
    wanted = set(requirement_tags)
    for doc in documents:
        if wanted & _doc_tags(doc):
            return doc
    return None


def compute_readiness(service_id: str, documents: list[Any], today: date | None = None) -> dict[str, Any] | None:
    """Requirement-by-requirement readiness for a service, with an overall status."""
    service = get_service(service_id)
    if service is None:
        return None

    reqs = service["requirements"]
    out_requirements: list[dict[str, Any]] = []
    satisfied = 0
    has_expired = False
    has_unknown = False

    for index, req in enumerate(reqs):
        matched = _match_document(req["tags"], documents)
        if not req["tags"]:
            status, reason, doc_id, doc_type, confidence = (
                "unknown",
                "Cannot be checked automatically — please confirm you have this.",
                None,
                None,
                1.0,
            )
            has_unknown = True
        elif matched is None:
            status, reason, doc_id, doc_type, confidence = (
                "missing",
                "No matching document found",
                None,
                None,
                1.0,
            )
        else:
            validity = extract_validity(matched.raw_text, today=today)
            doc_id = matched.slug
            doc_type = classify_document(matched.raw_text)["docType"]
            if validity["status"] == "expired":
                status, reason, confidence = "expired", "Found, but the document has expired", 0.9
                has_expired = True
            else:
                status, reason, confidence = "satisfied", f"Matching {doc_type or 'document'} found", 0.9
                satisfied += 1

        out_requirements.append(
            {
                "index": index,
                "label": req["label"],
                "status": status,
                "matchedDocumentId": doc_id,
                "matchedDocType": doc_type,
                "reason": reason,
                "confidence": confidence,
            }
        )

    total = len(reqs)
    detectable = sum(1 for r in reqs if r["tags"])  # requirements we can auto-check
    missing_detectable = detectable - satisfied
    score = round(satisfied / total * 100) if total else 0

    if has_expired:
        overall = "not_ready"
    elif missing_detectable == 0 and not has_unknown:
        overall = "ready"
    elif missing_detectable == 0 and has_unknown:
        # Everything we can verify is satisfied; only manual items remain.
        overall = "needs_confirmation"
    elif missing_detectable == 1:
        overall = "almost_ready"
    else:
        overall = "not_ready"

    return {
        "serviceId": service_id,
        "status": overall,
        "score": score,
        "satisfied": satisfied,
        "total": total,
        "requirements": out_requirements,
    }


def usable_for(document: Any, service_id: str, today: date | None = None) -> dict[str, Any] | None:
    """Whether one document appears to satisfy any requirement of a service."""
    service = get_service(service_id)
    if service is None:
        return None

    tags = _doc_tags(document)
    for req in service["requirements"]:
        if req["tags"] and (set(req["tags"]) & tags):
            validity = extract_validity(document.raw_text, today=today)
            if validity["status"] == "expired":
                result, reason = "expired", "Matches the required document type, but it has expired."
            elif validity["status"] == "unknown":
                result, reason = (
                    "needs_confirmation",
                    "Matches the required document type. Its validity could not be confirmed — check the service's requirement.",
                )
            else:
                result, reason = "likely_acceptable", "Matches the required document type."
            return {
                "serviceId": service_id,
                "requirement": req["label"],
                "result": result,
                "reason": reason,
            }

    return {
        "serviceId": service_id,
        "requirement": None,
        "result": "does_not_satisfy",
        "reason": "This document does not appear to match any required document for this service.",
    }
