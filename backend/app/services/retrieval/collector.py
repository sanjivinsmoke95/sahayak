"""Typed HTTP retrieval from the standalone government-data collector."""

from __future__ import annotations

from dataclasses import dataclass, field

import httpx

from app.config import settings
from app.schemas.services import GovChatCitation, GovServiceHit, GovServiceSearchResponse


@dataclass
class CollectorRetrieval:
    """Small, provenance-preserving context returned by the official corpus."""

    hits: list[GovServiceHit] = field(default_factory=list)
    citations: list[GovChatCitation] = field(default_factory=list)
    context: str = ""
    available: bool = True


def _citation(hit: GovServiceHit) -> GovChatCitation:
    return GovChatCitation(
        service_name=hit.service_name,
        source_url=hit.source_url,
        official_application_url=hit.official_application_url,
        source_type="official_service",
        department=hit.department,
        state=hit.state,
        last_updated=hit.last_updated,
        version=hit.version,
    )


def _service_context(hit: GovServiceHit, limit: int = 3_000) -> str:
    """Only include fields the collector extracted from an official source."""
    lines = [f"Service: {hit.service_name}"]
    if hit.department:
        lines.append(f"Department: {hit.department}")
    if hit.state:
        lines.append(f"State: {hit.state}")
    if hit.description:
        lines.append(f"Description: {hit.description}")
    if hit.eligibility:
        lines.append("Eligibility: " + "; ".join(hit.eligibility))
    if hit.required_documents:
        lines.append("Required documents: " + "; ".join(hit.required_documents))
    if hit.application_steps:
        lines.append("Application steps: " + "; ".join(hit.application_steps))
    if hit.fees:
        lines.append(f"Fees: {hit.fees}")
    if hit.processing_time:
        lines.append(f"Processing time: {hit.processing_time}")
    if hit.official_application_url:
        lines.append(f"Official application URL: {hit.official_application_url}")
    if hit.source_url:
        lines.append(f"Source URL: {hit.source_url}")
    return "\n".join(lines)[:limit]


async def search_official_services(
    question: str,
    *,
    state: str | None = None,
    department: str | None = None,
    language: str | None = None,
    limit: int = 3,
) -> CollectorRetrieval:
    """Run bounded hybrid search without ever touching the collector database."""
    if not settings.collector_enabled:
        return CollectorRetrieval(available=False)

    params: dict[str, str | int] = {"q": question, "mode": "hybrid", "limit": min(limit, 5)}
    for key, value in (("state", state), ("department", department), ("language", language)):
        if value:
            params[key] = value

    # Fail fast on connect so a stopped collector doesn't hang the request. A
    # localhost name resolves to both IPv4 and IPv6, and each refused connection
    # would otherwise wait the full read timeout, stacking to ~20s.
    timeout = httpx.Timeout(settings.collector_timeout, connect=2.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(f"{settings.collector_api_url.rstrip('/')}/search", params=params)
            response.raise_for_status()
        payload = GovServiceSearchResponse.model_validate(response.json())
    except (httpx.HTTPError, ValueError):
        # Retrieval is optional: document-grounded assistance still works.
        return CollectorRetrieval(available=False)

    hits = payload.results[:limit]
    return CollectorRetrieval(
        hits=hits,
        citations=[_citation(hit) for hit in hits],
        context="\n\n---\n\n".join(_service_context(hit) for hit in hits),
    )


def answer_from_official_hits(hits: list[GovServiceHit], question: str = "") -> str | None:
    """Safe deterministic answer used when no hosted model is available."""
    if not hits:
        return None
    top = hits[0]
    q_low = (question or "").lower()

    if any(
        phrase in q_low
        for phrase in (
            "what services are available",
            "services are available",
            "services available",
            "list of services",
            "services offered",
            "services provided",
            "what can i do on",
        )
    ):
        lines = [
            "Based on official MeeSeva records, citizen services are provided across several government departments, including:",
            "- Revenue Administration (e.g. Income Certificate, Caste Certificate, Land Value Certificate)",
            "- Civil Supplies (e.g. Print Ration Card, Ration Card Data Corrections, Member Additions)",
            "- UIDAI (e.g. Seed Your AADHAAR)",
            "- Energy / Utility Discoms (e.g. Electricity services and connections)",
            "- Election Commission (e.g. Electoral roll inclusion)",
            "Detailed requirements, fees, and processing times vary by individual service. (Note: This is an illustrative summary from available official records, not an exhaustive list.)",
        ]
        if top.official_application_url:
            lines.append(f"Official link: {top.official_application_url}")
        return "\n".join(lines)

    lines = [f"Based on the official information for '{top.service_name}':"]
    if top.description:
        lines.append(top.description)
    if top.required_documents:
        lines.append("Required documents: " + "; ".join(top.required_documents))
    if top.eligibility:
        lines.append("Eligibility: " + "; ".join(top.eligibility))
    if top.application_steps:
        lines.append("How to apply: " + "; ".join(top.application_steps))
    elif not top.required_documents and not top.eligibility:
        lines.append("Detailed application steps are not provided in the available official record.")
    if top.fees:
        lines.append(f"Fees: {top.fees}")
    if top.processing_time:
        lines.append(f"Processing time: {top.processing_time}")
    if top.official_application_url:
        lines.append(f"Official link: {top.official_application_url}")
    return "\n".join(lines)


def answer_combined_from_hits(doc: dict, hits: list[GovServiceHit], question: str = "") -> str | None:
    """Safe deterministic answer combining an active user document and official service hits."""
    if not doc or not hits:
        return None

    top = hits[0]
    q_low = (question or "").lower()
    doc_title = (
        doc.get("title", {}).get("en")
        if isinstance(doc.get("title"), dict)
        else str(doc.get("title") or "document")
    ).strip()
    doc_title_lower = doc_title.lower()

    asks_if_have = any(
        phrase in q_low
        for phrase in ("do i have them", "do i have it", "do i have the", "have them", "have i got")
    )

    # Extract keywords from doc_title (e.g. "aadhaar", "pan", "passport", "ration", "voter")
    doc_keywords = [
        w for w in doc_title_lower.split()
        if len(w) > 2 and w not in ("card", "document", "paper", "certificate", "copy", "the", "for")
    ]
    if not doc_keywords:
        doc_keywords = [doc_title_lower]

    def doc_in_text(text: str) -> bool:
        if not text:
            return False
        low = text.lower()
        return any(kw in low for kw in doc_keywords) or doc_title_lower in low

    # 1. Check if any hit explicitly lists this document in its required_documents
    hits_with_doc_required = [
        h for h in hits
        if any(doc_in_text(d) for d in h.required_documents)
    ]
    if hits_with_doc_required:
        target = hits_with_doc_required[0]
        lines = [
            f"According to the official information for '{target.service_name}', your {doc_title} is listed as a required document."
        ]
        if target.description:
            lines.append(target.description)
        if target.required_documents:
            lines.append("Required documents: " + "; ".join(target.required_documents))
        if target.eligibility:
            lines.append("Eligibility: " + "; ".join(target.eligibility))
        if target.application_steps:
            lines.append("How to apply: " + "; ".join(target.application_steps))
        if target.fees:
            lines.append(f"Fees: {target.fees}")
        if target.processing_time:
            lines.append(f"Processing time: {target.processing_time}")
        if target.official_application_url:
            lines.append(f"Official link: {target.official_application_url}")
        return "\n".join(lines)

    # 2. Check if a hit is a specialized service matching the document name (e.g. "Seed Your AADHAAR")
    hits_mentioning_doc_in_title = [
        h for h in hits
        if doc_in_text(h.service_name)
    ]
    if hits_mentioning_doc_in_title:
        target = hits_mentioning_doc_in_title[0]
        lines = [
            f"I found an official service called '{target.service_name}', but the available official information does not establish whether your {doc_title} can generally be used for other services. I cannot verify that from the information currently available."
        ]
        if target.description:
            lines.append(target.description)
        if target.fees:
            lines.append(f"Fees: {target.fees}")
        if target.processing_time:
            lines.append(f"Processing time: {target.processing_time}")
        if target.official_application_url:
            lines.append(f"Official link: {target.official_application_url}")
        return "\n".join(lines)

    # 3. Hit does not establish whether doc is accepted or required
    lines = [f"Based on the official information for '{top.service_name}':"]
    if top.description:
        lines.append(top.description)
    if top.required_documents:
        lines.append("Required documents: " + "; ".join(top.required_documents))
        lines.append(f"The official record does not list your {doc_title} among the required documents.")
    else:
        if asks_if_have:
            lines.append(
                f"The available official record does not list the specific required documents, so I cannot determine whether your saved {doc_title} satisfies the requirements. Please verify required documents with the official department."
            )
        else:
            lines.append(
                f"The available official record does not establish whether your {doc_title} is accepted or required for this service. I cannot verify that from the information currently available."
            )
    if top.fees:
        lines.append(f"Fees: {top.fees}")
    if top.processing_time:
        lines.append(f"Processing time: {top.processing_time}")
    if top.official_application_url:
        lines.append(f"Official link: {top.official_application_url}")

    return "\n".join(lines)
