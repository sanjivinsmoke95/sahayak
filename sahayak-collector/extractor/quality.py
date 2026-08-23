"""
Quality scoring for an extracted record (Part: QUALITY CHECK).

Deterministic and explainable. Combines:
  * completeness  — weighted fraction of important fields present
  * confidence    — do present values pass validation (fees look like fees,
                    phones/emails valid, urls governmental)?
  * penalties     — suspicious or duplicate values

Returns (score in 0..1, metrics dict) — the metrics are stored alongside so a
reviewer can see exactly why a page scored the way it did.
"""
from __future__ import annotations

from extractor import validators

# Field -> weight (importance for a government service record).
_WEIGHTS = {
    "service_name": 3.0,
    "long_description": 2.0,
    "eligibility": 2.0,
    "required_documents": 2.0,
    "application_steps": 2.0,
    "fees": 1.0,
    "processing_time": 1.0,
    "official_application_url": 1.5,
    "department": 1.0,
    "state": 1.0,
    "contact": 1.0,
    "faq": 0.5,
    "benefits": 0.5,
}


def _present(result, field: str) -> bool:
    val = getattr(result, field, None)
    if field == "contact":
        c = result.contact
        return bool(c and (c.phone or c.email or c.address))
    if isinstance(val, list):
        return len(val) > 0
    return bool(val)


def score(result) -> tuple[float, dict]:
    filled, missing = [], []
    got = 0.0
    total = sum(_WEIGHTS.values())
    for field, w in _WEIGHTS.items():
        if _present(result, field):
            got += w
            filled.append(field)
        else:
            missing.append(field)
    completeness = got / total if total else 0.0

    # Confidence checks on present values.
    suspicious: list[str] = []
    if result.fees and not validators.looks_like_fee(result.fees):
        suspicious.append("fees_value_not_recognised")
    for ph in result.contact.phone:
        if not validators.valid_phone(ph):
            suspicious.append("invalid_phone")
            break
    for em in result.contact.email:
        if not validators.is_valid_email(em):
            suspicious.append("invalid_email")
            break
    if result.official_application_url and not validators.valid_gov_url(result.official_application_url):
        suspicious.append("application_url_not_gov")
    if result.long_description and len(result.long_description) < 25:
        suspicious.append("description_too_short")

    # Duplicate detection within list fields.
    duplicates = []
    for f in ("eligibility", "required_documents", "application_steps"):
        vals = [v.lower().strip() for v in getattr(result, f)]
        if len(vals) != len(set(vals)):
            duplicates.append(f)

    confidence = 1.0 - min(0.5, 0.15 * len(suspicious))
    penalty = 0.05 * len(duplicates)
    final = max(0.0, round(completeness * confidence - penalty, 3))

    metrics = {
        "completeness": round(completeness, 3),
        "confidence": round(confidence, 3),
        "filled_fields": filled,
        "missing_fields": missing,
        "suspicious": suspicious,
        "duplicate_fields": duplicates,
        "field_count": len(filled),
    }
    return final, metrics
