"""
Classify an uploaded file: what kind of document is it, is it a government
document at all, and how confident are we.

This drives two things the reader sees. First, wrong-document detection — a
restaurant bill or a holiday photo should get a friendly "this is not a
government document", never a wall of OCR. Second, checklist matching — a
document's detected type is what lets an uploaded Aadhaar tick the "Aadhaar
Card" box on a pension notice.

It is intentionally conservative. An uncertain result says so rather than
inventing a type, because a wrong classification is worse than an honest
"I couldn't tell".
"""

import re

# A known government document type: (keywords, human name, checklist tags).
# `tags` are the tokens a requirement line is matched against.
GOV_TYPES: list[tuple[tuple[str, ...], str, tuple[str, ...]]] = [
    # Specific certificates and IDs are matched before broad types. A document
    # that only *mentions* pension (an income certificate valid "for pension
    # schemes") must classify by what it IS, not by an incidental word.
    (("permanent account number", "income tax department", "pan card"), "PAN Card", ("pan",)),
    (
        ("aadhaar", "aadhar", "unique identification", "uidai", "आधार", "ఆధార్"),
        "Aadhaar Card",
        ("aadhaar", "aadhar"),
    ),
    (("income certificate",), "Income Certificate", ("income certificate", "income")),
    (
        ("caste certificate", "community certificate"),
        "Caste Certificate",
        ("caste", "community"),
    ),
    (
        ("residence certificate", "domicile certificate", "residential certificate"),
        "Residence Certificate",
        ("residence", "domicile"),
    ),
    (
        ("disability certificate", "udid", "persons with disabilities", "divyang"),
        "Disability Certificate",
        ("disability",),
    ),
    (("birth certificate",), "Birth Certificate", ("birth certificate",)),
    (("death certificate",), "Death Certificate", ("death certificate",)),
    (("ration card",), "Ration Card", ("ration",)),
    (("driving licence", "driving license"), "Driving Licence", ("driving licence", "licence")),
    (("passport",), "Passport", ("passport",)),
    (
        ("voter", "electoral", "epic no", "election commission"),
        "Voter ID",
        ("voter", "epic"),
    ),
    (
        ("bank passbook", "passbook", "ifsc"),
        "Bank Passbook",
        ("bank passbook", "passbook", "bank"),
    ),
    (("scholarship", "bursary"), "Scholarship Document", ("scholarship",)),
    # Pension is matched by pension-SPECIFIC phrases only — never the bare word
    # "pension" — so incidental mentions in other documents don't trigger it.
    # It is checked before life certificate, so a pension notice that lists a
    # life certificate as a requirement is still a pension document.
    (
        (
            "ppo",
            "pensioner",
            "pension payment order",
            "pension renewal",
            "pension records",
            "monthly pension",
            "old age pension",
            "widow pension",
            "disability pension",
            "pension sanction",
            "superannuation pension",
        ),
        "Pension Document",
        ("pension",),
    ),
    (
        ("life certificate", "jeevan pramaan"),
        "Life Certificate",
        ("life certificate", "jeevan pramaan"),
    ),
]

# Structural document types detected before the type keywords above, so a form
# that contains an "Aadhaar Number" field is a form (not an Aadhaar card), and a
# rejection that mentions a scheme is a rejection (not that scheme's document).
_REJECTION_SIGNALS = (
    "application rejected",
    "has been rejected",
    "application is rejected",
    "application was rejected",
    "stands rejected",
    "not approved",
    "disapproved",
    "regret to inform you",
)
_APPROVAL_SIGNALS = (
    "sanction order",
    "has been sanctioned",
    "sanctioned in favour",
    "application approved",
    "is hereby approved",
    "approval order",
)
_FORM_HINTS = (
    "application form",
    "please fill",
    "signature of applicant",
    "affix your photograph",
    "affix photo",
    "declaration by the applicant",
    "to be filled by the applicant",
)

# Signals that a document is NOT a government document.
_NON_GOV = (
    "restaurant",
    "cafe",
    "menu",
    "invoice",
    "gst invoice",
    "tax invoice",
    "bill no",
    "subtotal",
    "grand total",
    "qty",
    "quantity",
    "thank you for dining",
    "thank you for shopping",
    "order id",
    "cart",
    "checkout",
    "delivery",
    "boarding pass",
    "ticket",
)

# General signals that a document IS official.
_GOV_HINTS = (
    "government",
    "govt",
    "certificate",
    "department",
    "tahsildar",
    "mandal",
    "municipal",
    "corporation",
    "registrar",
    "gazette",
    "sub-registrar",
    "revenue",
    "sachivalayam",
    "meeseva",
    "mee seva",
    "telangana",
    "andhra pradesh",
    "government of india",
)

_PAN_RE = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
_AADHAAR_RE = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")


def classify_document(raw_text: str | None) -> dict:
    """Return {docType, tags, isGovernment, confidence} for the extracted text."""
    text = (raw_text or "").strip()
    lowered = text.lower()

    # Too little readable text to judge.
    if len(text) < 25:
        return {
            "docType": "",
            "tags": [],
            "isGovernment": False,
            "confidence": 0.2,
        }

    # Structural types first: what the document DOES (reject / approve / a blank
    # form to fill) outranks any scheme or document it happens to name.
    if any(sig in lowered for sig in _REJECTION_SIGNALS):
        return {"docType": "Rejection Notice", "tags": [], "isGovernment": True, "confidence": 0.85}
    if any(sig in lowered for sig in _APPROVAL_SIGNALS):
        return {"docType": "Approval Notice", "tags": [], "isGovernment": True, "confidence": 0.8}
    if any(h in lowered for h in _FORM_HINTS):
        return {"docType": "Application Form", "tags": [], "isGovernment": True, "confidence": 0.8}

    # A known government type is the strongest remaining signal.
    for keywords, name, tags in GOV_TYPES:
        if any(k in lowered for k in keywords):
            return {
                "docType": name,
                "tags": list(tags),
                "isGovernment": True,
                "confidence": 0.9,
            }

    gov_hits = sum(1 for h in _GOV_HINTS if h in lowered)
    non_gov_hits = sum(1 for s in _NON_GOV if s in lowered)
    has_id = bool(_PAN_RE.search(text) or _AADHAAR_RE.search(text))

    if has_id or gov_hits >= 2:
        return {
            "docType": "Government document",
            "tags": [],
            "isGovernment": True,
            "confidence": 0.7 if gov_hits < 3 else 0.85,
        }

    # Looks like something else entirely.
    if non_gov_hits >= 2 and gov_hits == 0:
        guess = "receipt" if any(w in lowered for w in ("invoice", "bill", "total")) else ""
        return {
            "docType": guess or "non-government document",
            "tags": [],
            "isGovernment": False,
            "confidence": 0.7,
        }

    # A single official hint: probably a document, but say so weakly.
    if gov_hits == 1:
        return {"docType": "", "tags": [], "isGovernment": True, "confidence": 0.5}

    # Nothing to go on.
    return {"docType": "", "tags": [], "isGovernment": False, "confidence": 0.3}
