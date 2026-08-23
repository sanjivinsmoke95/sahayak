"""
Advanced document workflows: explaining a rejection, reading verification
signals, and helping fill a form from documents the reader already has.

Everything is grounded in the document text. A rejection reason is quoted, not
guessed ("Reason not stated in the document" when absent); verification only
reports *signals* and points to the official checker (never "authentic"); form
values are only *suggested* from the reader's own documents, never entered or
submitted anywhere.
"""

from __future__ import annotations

import re
from typing import Any

from app.services.personal_details import extract_personal

# ----------------------------------------------------------------------------
# Rejection explainer
# ----------------------------------------------------------------------------

_REJECTION_SIGNALS = (
    "rejected",
    "not approved",
    "disapproved",
    "denied",
    "declined",
    "disqualified",
    "not eligible",
    "returned",
    "cannot be approved",
    "application is rejected",
    "your application has been rejected",
)

_REASON_RE = re.compile(
    r"(?:reason(?:s)?(?:\s*for\s*rejection)?|due to|because of|on the ground[s]?\s*(?:that)?|"
    r"rejected as|returned as|owing to)[:\-\s]+([^\n.]{5,220})",
    re.IGNORECASE,
)

_CAUSE_KEYWORDS = {
    "expired": ("expired", "validity", "not valid", "out of date", "lapsed"),
    "mismatch": ("mismatch", "does not match", "not matching", "discrepancy", "differs"),
    "missing": ("missing", "not attached", "incomplete", "not enclosed", "not submitted", "not provided"),
    "illegible": ("illegible", "not clear", "unreadable", "blurred"),
    "ineligible": ("not eligible", "ineligible", "criteria not met", "does not qualify"),
}

_DOC_MENTIONS = (
    "income certificate",
    "aadhaar",
    "pan",
    "bank passbook",
    "ration card",
    "residence",
    "caste certificate",
    "life certificate",
    "photo",
    "signature",
)

_EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
_URL_RE = re.compile(r"https?://[^\s|)]+|www\.[^\s|)]+", re.IGNORECASE)
_PHONE_RE = re.compile(r"\b(?:\+91[\s-]?)?[6-9]\d{9}\b")


def analyze_rejection(raw_text: str | None) -> dict[str, Any]:
    text = raw_text or ""
    lowered = text.lower()

    is_rejection = any(sig in lowered for sig in _REJECTION_SIGNALS)

    reason_match = _REASON_RE.search(text)
    reason = reason_match.group(1).strip(" .:-") if reason_match else None

    causes = [name for name, kws in _CAUSE_KEYWORDS.items() if any(k in lowered for k in kws)]
    related = [d for d in _DOC_MENTIONS if d in lowered]

    actions: list[str] = []
    if "expired" in causes:
        actions.append("Obtain an updated copy of the document and resubmit.")
    if "mismatch" in causes:
        actions.append("Correct the mismatch between your documents before resubmitting.")
    if "missing" in causes:
        actions.append("Attach the missing document and submit again.")
    if "illegible" in causes:
        actions.append("Upload a clearer copy of the document.")
    if "ineligible" in causes:
        actions.append("Check the eligibility criteria for this service before reapplying.")
    # Always add the safe, non-fabricated closing guidance.
    actions.append("Re-check the official requirements and follow the resubmission or appeal process stated in the notice.")

    appeal = {
        "phones": list(dict.fromkeys(_PHONE_RE.findall(text)))[:2],
        "emails": list(dict.fromkeys(_EMAIL_RE.findall(text)))[:2],
        "urls": list(dict.fromkeys(_URL_RE.findall(text)))[:2],
    }

    return {
        "isRejection": is_rejection,
        "reasonStated": reason is not None,
        "reason": reason,
        "relatedDocuments": related,
        "suggestedActions": actions,
        "appeal": appeal,
        "confidence": 0.75 if (is_rejection and reason) else 0.5 if is_rejection else 0.3,
    }


# ----------------------------------------------------------------------------
# Verification signals
# ----------------------------------------------------------------------------

_CERT_NO_RE = re.compile(
    r"(?:certificate|reference|application|ppo)\s*(?:no|number|id)\.?\s*[:\-]?\s*([A-Za-z0-9/\-]{4,})",
    re.IGNORECASE,
)
_AUTHORITY_KEYWORDS = (
    "government of",
    "department of",
    "tahsildar",
    "registrar",
    "municipal",
    "corporation",
    "revenue",
    "issuing authority",
    "mandal",
    "sachivalayam",
    "meeseva",
)


def _mask(value: str) -> str:
    trimmed = value.strip()
    if len(trimmed) <= 3:
        return "•" * len(trimmed)
    return "•" * max(4, len(trimmed) - 3) + trimmed[-3:]


def verification_signals(raw_text: str | None) -> dict[str, Any]:
    text = raw_text or ""
    lowered = text.lower()
    signals: list[dict[str, Any]] = []

    cert = _CERT_NO_RE.search(text)
    signals.append(
        {"type": "certificate_number", "detected": bool(cert), "value": _mask(cert.group(1)) if cert else None}
    )
    signals.append(
        {"type": "issuing_authority", "detected": any(k in lowered for k in _AUTHORITY_KEYWORDS), "value": None}
    )
    signals.append(
        {"type": "qr_code", "detected": "qr" in lowered or "quick response" in lowered, "value": None}
    )
    signals.append(
        {
            "type": "digital_signature",
            "detected": any(
                k in lowered
                for k in ("digitally signed", "digital signature", "e-signed", "dsc", "signature valid")
            ),
            "value": None,
        }
    )
    url = _URL_RE.search(text)
    signals.append(
        {"type": "verification_url", "detected": bool(url), "value": url.group(0) if url else None}
    )

    return {"signals": signals}


# ----------------------------------------------------------------------------
# Form assistant
# ----------------------------------------------------------------------------

_INCOME_RE = re.compile(
    r"annual income[^0-9]{0,40}?(?:rs\.?|₹|=)?\s*([0-9][0-9,]{3,})", re.IGNORECASE
)

# A form field: detection keywords in the form text, and the profile key that
# can suggest a value. Sensitive keys are masked in the UI by default.
_FORM_FIELDS = [
    ("name", (r"\bname\b",), "name", False),
    ("father", (r"father'?s?\s*name", r"guardian'?s?\s*name"), "father", False),
    ("dob", (r"date of birth", r"\bdob\b"), "dob", False),
    ("annualIncome", (r"annual (?:family )?income",), "annualIncome", False),
    ("aadhaar", (r"aadhaar", r"aadhar"), "aadhaar", True),
    ("pan", (r"\bpan\b",), "pan", True),
    ("mobile", (r"mobile", r"phone"), "mobile", False),
    ("address", (r"address", r"residing at"), "address", False),
]

_FORM_HINTS = ("application", "form", "declaration", "please fill", "affix", "signature of applicant")


def _merged_profile(documents: list[Any]) -> dict[str, tuple[str, str]]:
    """
    Merge personal values across the reader's documents. Each value is stored
    with the title of the document it came from, so the UI can show the source.
    """
    profile: dict[str, tuple[str, str]] = {}

    def put(key: str, value: str | None, source: str) -> None:
        if value and key not in profile:
            profile[key] = (value, source)

    for doc in documents:
        text = getattr(doc, "raw_text", None)
        if not text:
            continue
        title = (doc.title or {}).get("en") if isinstance(getattr(doc, "title", None), dict) else None
        source = title or getattr(doc, "slug", "document")
        for field in extract_personal(text):
            label = field["label"]["en"]
            value = field["value"]
            if label == "Name":
                put("name", value, source)
            elif label == "Father's name":
                put("father", value, source)
            elif label == "Date of birth":
                put("dob", value, source)
            elif label == "PAN number":
                put("pan", value, source)
            elif label == "Aadhaar number":
                put("aadhaar", value, source)
        income = _INCOME_RE.search(text)
        if income:
            put("annualIncome", income.group(1), source)
        phone = _PHONE_RE.search(text)
        if phone:
            put("mobile", phone.group(0), source)

    return profile


def analyze_form(raw_text: str | None, documents: list[Any]) -> dict[str, Any]:
    text = raw_text or ""
    lowered = text.lower()

    detected_keys: list[tuple[str, str, bool]] = []
    for key, patterns, profile_key, sensitive in _FORM_FIELDS:
        if any(re.search(p, lowered) for p in patterns):
            detected_keys.append((key, profile_key, sensitive))

    is_form = len(detected_keys) >= 3 and any(h in lowered for h in _FORM_HINTS)

    profile = _merged_profile(documents)
    fields: list[dict[str, Any]] = []
    for key, profile_key, sensitive in detected_keys:
        suggestion = profile.get(profile_key)
        fields.append(
            {
                "key": key,
                "sensitive": sensitive,
                "suggestedValue": suggestion[0] if suggestion else None,
                "source": suggestion[1] if suggestion else None,
                "confidence": 0.8 if suggestion else 0.0,
            }
        )

    return {"isForm": is_form, "fields": fields}
