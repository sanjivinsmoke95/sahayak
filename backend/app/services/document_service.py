"""
Everything that turns database rows into the shape the phone expects, and
back again. Routers stay thin; this is where the rules live.
"""

import json
import os
import re
from datetime import date
from pathlib import Path
from typing import Any
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Document, User
from app.services.classification import classify_document
from app.services.personal_details import extract_personal

def _find_seed_path() -> Path | None:
    """
    Locate the shared sample_documents.json.

    The layout differs between local development (repo/backend/app/...) and the
    Docker image (/app/app/...), and the file can also be pointed at explicitly.
    Search the known locations rather than assuming one, so the demo notices are
    never silently missing — which is what made a fresh account an empty shell.
    """
    override = os.getenv("SAHAYAK_SEED_PATH")
    candidates = [Path(override)] if override else []
    here = Path(__file__).resolve()
    candidates += [
        parent / "database" / "seed" / "sample_documents.json" for parent in here.parents
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


SEED_PATH = _find_seed_path()


def load_samples() -> list[dict[str, Any]]:
    """The bundled demo notices, read once from the shared seed file."""
    if not SEED_PATH:
        return []
    with SEED_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


SAMPLES: list[dict[str, Any]] = load_samples()
SAMPLES_BY_ID: dict[str, dict[str, Any]] = {s["id"]: s for s in SAMPLES}


def basic_analysis(raw_text: str, filename: str) -> dict[str, Any]:
    """Fill the reader with safe certificate facts when no AI key is configured."""
    preview = raw_text[:6000]
    normalized = " ".join(raw_text.split())
    lowered = normalized.lower()
    # OCR often drops spaces ("INCOMECERTIFICATE"); match against a de-spaced copy
    # too so keyword detection survives imperfect scans.
    collapsed = lowered.replace(" ", "")

    certificate_type = "Certificate"
    purpose = "proof of the information stated on this certificate"
    category = "identity"
    for keywords, label, meaning, candidate_category in (
        (
            ("permanent account number", "income tax department", "pan card"),
            "PAN Card",
            "an identity and tax-related document",
            "identity",
        ),
        (
            ("aadhaar", "aadhar", "unique identification", "uidai", "आधार"),
            "Aadhaar Card",
            "proof of identity and address",
            "identity",
        ),
        (
            ("residence certificate", "residential certificate", "domicile certificate"),
            "Residence Certificate",
            "proof of residence",
            "identity",
        ),
        (
            ("caste certificate", "community certificate"),
            "Caste / Community Certificate",
            "proof of caste or community",
            "identity",
        ),
        (("income certificate",), "Income Certificate", "proof of income", "identity"),
        (("birth certificate",), "Birth Certificate", "proof of birth details", "identity"),
        (("death certificate",), "Death Certificate", "proof of death details", "identity"),
        (
            ("education certificate", "bonafide certificate"),
            "Education Certificate",
            "proof of education or enrolment",
            "education",
        ),
    ):
        if any(
            keyword in lowered or keyword.replace(" ", "") in collapsed
            for keyword in keywords
        ):
            certificate_type, purpose, category = label, meaning, candidate_category
            break

    issuer = "The issuing authority is printed on the certificate."
    if "telangana" in lowered:
        issuer = "Government of Telangana"
    elif "government of india" in lowered:
        issuer = "Government of India"

    urls = re.findall(r"https?://[^\s|]+|www\.[^\s|]+", normalized, flags=re.IGNORECASE)
    verification = (
        f"You can verify this certificate at {urls[0]}. "
        "Keep the application or certificate number ready."
        if urls
        else "No submission or verification office is clearly stated in this certificate."
    )

    def localized(value: str) -> dict[str, str]:
        return {"en": value, "hi": value, "te": value}

    return {
        "cat": category,
        "status": "info",
        # Use the detected type as the title. Never fall back to the raw upload
        # filename (often a UUID like "8fe3…​.jpg"), which is meaningless to a reader.
        "title": localized(certificate_type),
        "issuer": localized(issuer),
        "what": localized(f"This is your {certificate_type}. It is used as {purpose}."),
        "why": localized(f"It serves as {purpose}."),
        "where": localized(verification),
        "ifNot": localized("This certificate does not state a penalty or deadline."),
        "steps": [
            localized(
                "Keep the original certificate and its application or certificate number safe."
            ),
            localized("Use it only where the receiving organisation asks for this certificate."),
        ],
        "need": [
            localized("The original certificate or a clear copy"),
            localized("Application or certificate number, if requested"),
        ],
        "explain": localized(preview),
    }


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


# Words a requirement line might use, mapped to the checklist tags a matching
# uploaded document would carry. Lets "Bank Passbook" match an uploaded passbook.
_REQUIREMENT_TAGS: dict[str, tuple[str, ...]] = {
    "aadhaar": ("aadhaar", "aadhar"),
    "aadhar": ("aadhaar", "aadhar"),
    "pan": ("pan",),
    "passbook": ("passbook", "bank passbook", "bank"),
    "bank": ("bank", "passbook"),
    "pension": ("pension",),
    "life certificate": ("life certificate", "jeevan pramaan"),
    "income": ("income", "income certificate"),
    "caste": ("caste", "community"),
    "residence": ("residence", "domicile"),
    "domicile": ("residence", "domicile"),
    "ration": ("ration",),
    "voter": ("voter", "epic"),
    "passport": ("passport",),
    "licence": ("driving licence", "licence"),
    "birth certificate": ("birth certificate",),
    "death certificate": ("death certificate",),
}


def detected_tags(documents: list[Document]) -> set[str]:
    """The set of checklist tags for every real document the user has uploaded."""
    tags: set[str] = set()
    for doc in documents:
        if doc.is_sample or not doc.raw_text:
            continue
        result = classify_document(doc.raw_text)
        if result["isGovernment"]:
            tags.update(result["tags"])
            if result["docType"]:
                tags.add(result["docType"].lower())
    return tags


def _need_match_flags(need_items: list[dict[str, Any]], tags: set[str]) -> list[bool]:
    """
    For each required-document line, True when the user has uploaded a document
    that satisfies it. Matching is by tag, so it only ticks on real detection.
    """
    flags: list[bool] = []
    for item in need_items:
        text = str((item or {}).get("en", "")).lower()
        matched = False
        for keyword, keyword_tags in _REQUIREMENT_TAGS.items():
            if keyword in text and tags.intersection(keyword_tags):
                matched = True
                break
        flags.append(matched)
    return flags


def to_api(
    document: Document,
    detailed: bool = False,
    tags: set[str] | None = None,
) -> dict[str, Any]:
    """
    Row -> the exact JSON the frontend's SahayakDocument interface expects.

    `detailed` opens a single document: it adds the structured personal fields
    read from the notice. The list view leaves it off so a folder of documents
    stays a single cheap query with no per-row text parsing.

    `tags` are the checklist tags for every document the user has uploaded; when
    given, each required-document line is ticked only where a matching document
    has actually been detected — never by hand.
    """
    # Documents uploaded before certificate parsing was added may have OCR text
    # but empty cards. Derive the missing safe fields on read so the existing
    # document becomes useful immediately; no re-upload is required.
    fallback = basic_analysis(document.raw_text, document.slug) if document.raw_text else {}

    def value(field: str, current: Any) -> Any:
        if current not in (None, "", [], {}):
            return current
        return fallback.get(field, current)

    needs = value("need", document.needs)
    if tags is not None:
        need_done = _need_match_flags(needs, tags)
    else:
        need_done = document.need_done or []

    classification = (
        classify_document(document.raw_text)
        if document.raw_text and not document.is_sample
        else {"docType": "", "isGovernment": True, "confidence": 1.0}
    )

    return {
        "id": document.slug,
        "cat": document.category if document.category != "other" else fallback.get("cat", "other"),
        "status": document.status,
        "seeded": document.is_sample,
        "title": value("title", document.title),
        "issuer": value("issuer", document.issuer),
        "refNo": document.ref_no,
        # Fall back to the day the document was saved so uploads made before
        # received_on was recorded still show a real date, never "Invalid Date".
        "received": (
            document.received_on.isoformat()
            if document.received_on
            else document.created_at.date().isoformat()
            if document.created_at
            else ""
        ),
        "deadline": document.deadline_on.isoformat() if document.deadline_on else None,
        "what": value("what", document.what),
        "why": value("why", document.why),
        "steps": value("steps", document.steps),
        "need": needs,
        "needDone": need_done,
        "where": value("where", document.where),
        "ifNot": value("ifNot", document.if_not),
        "explain": value("explain", document.explain),
        "gov": document.gov,
        "original": document.original,
        "pairs": document.pairs or [],
        "elig": document.eligibility,
        # Structured personal fields, only for a single opened document.
        "personal": extract_personal(document.raw_text) if detailed else [],
        # Classification used for wrong-document detection and checklist matching.
        "docType": classification["docType"],
        "isGovernment": classification["isGovernment"],
        "confidence": round(float(classification["confidence"]), 2),
    }


def from_sample(sample: dict[str, Any], user_id: str) -> Document:
    """Builds a row from a bundled sample or from AI-analysed output."""
    return Document(
        user_id=user_id,
        slug=sample["id"],
        ref_no=sample.get("refNo", ""),
        category=sample.get("cat", "other"),
        status=sample.get("status", "action"),
        is_sample=True,
        received_on=_parse_date(sample.get("received")),
        deadline_on=_parse_date(sample.get("deadline")),
        title=sample.get("title", {}),
        issuer=sample.get("issuer", {}),
        what=sample.get("what", {}),
        why=sample.get("why", {}),
        where=sample.get("where", {}),
        if_not=sample.get("ifNot", {}),
        explain=sample.get("explain", {}),
        original=sample.get("original", ""),
        gov=sample.get("gov", {}),
        pairs=sample.get("pairs", []),
        steps=sample.get("steps", []),
        needs=sample.get("need", []),
        need_done=sample.get("needDone", []),
        eligibility=sample.get("elig"),
        checklist={"steps": {}, "need": {}},
    )


def from_analysis(analysis: dict[str, Any], user_id: str, raw_text: str, filename: str) -> Document:
    """Build a safe, complete document row from extracted text and optional AI output."""

    def localized(value: Any, fallback: str = "") -> dict[str, str]:
        if not isinstance(value, dict):
            value = {}
        english = str(value.get("en") or fallback)
        return {
            "en": english,
            "hi": str(value.get("hi") or english),
            "te": str(value.get("te") or english),
        }

    category = (
        analysis.get("cat")
        if analysis.get("cat")
        in {"pension", "scheme", "tax", "identity", "property", "education", "other"}
        else "other"
    )
    status = (
        analysis.get("status") if analysis.get("status") in {"action", "done", "info"} else "info"
    )
    steps = analysis.get("steps") if isinstance(analysis.get("steps"), list) else []
    needs = analysis.get("need") if isinstance(analysis.get("need"), list) else []
    normalized_steps = [localized(step) for step in steps if isinstance(step, dict)]
    normalized_needs = [localized(need) for need in needs if isinstance(need, dict)]

    return Document(
        user_id=user_id,
        slug=f"upload-{uuid4().hex[:12]}",
        category=category,
        status=status,
        is_sample=False,
        # The day the document was read. Prevents an empty "Received" that the
        # UI would otherwise render as "Invalid Date".
        received_on=_parse_date(analysis.get("received")) or date.today(),
        deadline_on=_parse_date(analysis.get("deadline")),
        # Fall back to a clean generic label, never the raw upload filename.
        title=localized(analysis.get("title"), "Uploaded document"),
        issuer=localized(analysis.get("issuer")),
        what=localized(analysis.get("what"), "Text was extracted from the uploaded document."),
        why=localized(analysis.get("why")),
        where=localized(analysis.get("where")),
        if_not=localized(analysis.get("ifNot")),
        explain=localized(analysis.get("explain"), raw_text[:2000]),
        original=raw_text,
        gov={"what": "", "why": "", "doIt": "", "where": ""},
        pairs=[],
        steps=normalized_steps,
        needs=normalized_needs,
        need_done=[False] * len(normalized_needs),
        checklist={"steps": {}, "need": {}},
        raw_text=raw_text,
    )


async def get_user_documents(db: AsyncSession, user: User) -> list[Document]:
    result = await db.execute(
        select(Document).where(Document.user_id == user.id).order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())


async def get_document_by_slug(db: AsyncSession, user: User, slug: str) -> Document | None:
    result = await db.execute(
        select(Document).where(Document.user_id == user.id, Document.slug == slug)
    )
    return result.scalar_one_or_none()


async def ensure_seeded(db: AsyncSession, user: User) -> None:
    """
    A brand new account gets the sample notices, so the app is never an empty
    shell on first open. Runs once; existing documents are left alone.
    """
    existing = await db.execute(select(Document.id).where(Document.user_id == user.id).limit(1))
    if existing.scalar_one_or_none():
        return

    for sample in SAMPLES:
        if sample.get("seeded"):
            db.add(from_sample(sample, user.id))
    await db.flush()


async def add_sample(db: AsyncSession, user: User, sample_id: str) -> Document | None:
    """Adds a demo notice to the account, or returns the one already there."""
    sample = SAMPLES_BY_ID.get(sample_id)
    if not sample:
        return None

    existing = await get_document_by_slug(db, user, sample_id)
    if existing:
        return existing

    document = from_sample(sample, user.id)
    db.add(document)
    await db.flush()
    return document


def build_checklist_map(documents: list[Document]) -> dict[str, Any]:
    """
    Frontend wants {docSlug: {steps: {0: true}, need: {0: true}}}.

    `steps` are the actions the reader ticks off by hand. `need` — the required
    documents — is not hand-ticked: each line is marked done only when a
    matching document has actually been uploaded and detected.
    """
    tags = detected_tags(documents)
    result: dict[str, Any] = {}
    for doc in documents:
        needs = doc.needs or []
        flags = _need_match_flags(needs, tags)
        need_state = {str(i): True for i, matched in enumerate(flags) if matched}
        result[doc.slug] = {
            "steps": (doc.checklist or {}).get("steps", {}),
            "need": need_state,
        }
    return result
