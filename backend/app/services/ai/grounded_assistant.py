"""Phase-1 orchestration for the existing assistant endpoint with 5-route intent classification."""

from __future__ import annotations

from enum import Enum
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas import AskResponse
from app.services.ai import RuleBasedProvider, get_provider
from app.services.ai.rule_based import detect_intent
from app.services.retrieval.collector import (
    answer_combined_from_hits,
    answer_from_official_hits,
    search_official_services,
)
from app.services.retrieval.user_documents import retrieve_user_documents


_UNVERIFIED = (
    "I could not verify that from your saved documents or the official government information "
    "available."
)

_LOCATION_ANSWER = (
    "To find the nearest MeeSeva or government office, please use the SAHAYAK Centre Finder "
    "with device location access enabled. I cannot determine your physical location or the closest office "
    "from the current assistant knowledge."
)

_FRESHNESS_ANSWER = (
    "The uploaded document does not provide the latest 2026 government rule, "
    "and I cannot verify recent or 2026 rule changes from the available official government information."
)


class AssistantRoute(str, Enum):
    LOCATION = "location"
    FRESHNESS = "freshness"
    DOCUMENT_ONLY = "document_only"
    COMBINED = "combined"
    GOVERNMENT_ONLY = "government_only"
    DOC_MATCH = "doc_match"


_LOCATION_PHRASES = (
    "nearest", "closest", "near me", "closest to me", "nearby", "near by",
    "location of", "find center", "find centre", "closest office", "closest centre", "closest center",
    "meeseva office closest", "office closest", "center closest", "centre closest",
    "where is the nearest", "where is nearest", "where can i find a meeseva",
)

_FRESHNESS_PATTERNS = (
    "latest rule", "latest rules", "current rule", "current rules", "new rule", "new rules",
    "government rule for", "rule for aadhaar in", "rules in 2026", "rule in 2026",
    "in 2026", "in 2025", "for 2026", "for 2025", "today's rule", "recent update",
    "recent updates", "recent changes", "latest update", "latest updates", "latest aadhaar rule",
)

_DOCUMENT_EXPLICIT_PHRASES = (
    "this document", "my document",
    "this card", "my card",
    "this paper", "my paper",
    "this certificate", "my certificate",
    "this notice", "my notice",
    "this form", "my form",
    "this aadhaar", "my aadhaar", "this pan", "my pan",
    "this passport", "my passport", "this voter", "my voter",
    "what is this", "what does this", "what information is on this",
    "what information is present", "what details are on this",
    "information present on this", "information on this document",
    "details present on this", "details on this document",
    "why did i receive", "why do i have", "why was this issued",
    "who issued this", "when is the deadline", "what is the last date",
    "what should i do now", "what are the next steps", "if i do nothing",
)

_PUBLIC_SERVICE_PATTERNS = (
    "apply for", "how to apply", "application process", "application steps", "apply", "application",
    "service charge", "official fee", "fee for", "fees for", "fee of", "cost of", "fee", "fees",
    "processing time", "eligibility criteria", "eligibility for", "procedure for", "process for",
    "what services are available", "services are available", "available through meeseva", "services available",
    "services provided", "list of services", "what can i do on", "what is meeseva",
    "welcome to meeseva", "income certificate", "ration card", "pension", "caste certificate",
    "birth certificate", "death certificate", "residence certificate", "seed your aadhaar",
    "print ration card", "data corrections", "scheme", "yojana", "portal", "meeseva"
)

_COMBINED_RELATION_PHRASES = (
    "can i use", "use this", "use my", "does this document help", "does this card help",
    "does this help me apply", "is this accepted", "is this card accepted", 
    "is this document accepted", "help me apply",
)

_DOC_MATCH_PHRASES = (
    "do i have them", "do i have the required", "do i have the documents required",
    "do i have the documents", "which required documents do i already have",
    "can i apply with the documents i uploaded", "do my documents satisfy the requirements",
    "do i have what is needed", "do i have what's needed", "which documents do i have"
)

_DOCUMENT_INTENTS = {"deadline", "need", "where", "ifnot", "why", "what", "steps", "elig", "doc_info"}


def _classify_route(question: str, has_active_doc: bool) -> AssistantRoute:
    lowered = question.lower()

    # 1. Location intent (highest priority: do not route to generic RAG)
    if any(p in lowered for p in _LOCATION_PHRASES):
        return AssistantRoute.LOCATION

    # 2. Freshness intent (do not answer from static docs)
    if any(p in lowered for p in _FRESHNESS_PATTERNS):
        return AssistantRoute.FRESHNESS

    # 3. Features extraction
    has_doc_ref = any(p in lowered for p in _DOCUMENT_EXPLICIT_PHRASES) or any(
        w in lowered for w in ("this card", "my card", "this document", "my document", "this aadhaar", "my aadhaar", "this pan", "my pan", "on this document", "with this document")
    )
    has_public_ref = any(p in lowered for p in _PUBLIC_SERVICE_PATTERNS) or detect_intent(question).startswith("cat_")
    has_combined_relation = any(p in lowered for p in _COMBINED_RELATION_PHRASES)

    has_doc_match = any(p in lowered for p in _DOC_MATCH_PHRASES)

    if has_active_doc:
        # Document matching intent
        if has_doc_match and has_public_ref:
            return AssistantRoute.DOC_MATCH
            
        # Combined explicitly stated
        if has_combined_relation:
            return AssistantRoute.COMBINED
        
        # Explicitly asking about the document takes priority over a random public ref
        # e.g. "What do I need to do with this document?" -> DOCUMENT_ONLY
        if has_doc_ref:
            return AssistantRoute.DOCUMENT_ONLY
            
        # Explicitly naming a government service takes priority if NO document reference is made
        # e.g. "What documents do I need for Print Ration Card?" -> GOVERNMENT_ONLY
        if has_public_ref:
            return AssistantRoute.GOVERNMENT_ONLY
            
        # Implicitly asking about the document (e.g. "What documents do I need?")
        if detect_intent(question) in _DOCUMENT_INTENTS:
            return AssistantRoute.DOCUMENT_ONLY
            
        # Fallback when active doc is open
        return AssistantRoute.DOCUMENT_ONLY

    # No active doc
    if has_public_ref:
        return AssistantRoute.GOVERNMENT_ONLY
    
    return AssistantRoute.GOVERNMENT_ONLY


def _filter_used_citations(
    all_citations: list[GovChatCitation],
    answer_text: str,
    active_document: dict | None,
    document_specific: bool,
    combined_question: bool,
    official_hits: list[GovServiceHit],
) -> list[GovChatCitation]:
    """Filter candidate citations to only those actually used to support the answer."""
    if not answer_text or not all_citations:
        return []

    text_lower = answer_text.lower()
    used_citations: list[GovChatCitation] = []
    seen_keys: set[str] = set()

    # 1. User document citations
    if active_document and (document_specific or combined_question):
        doc_id = active_document.get("id")
        doc_title = (
            active_document.get("title", {}).get("en")
            if isinstance(active_document.get("title"), dict)
            else str(active_document.get("title") or "")
        )
        for c in all_citations:
            if c.source_type == "user_document":
                if c.document_id == doc_id or (doc_title and c.service_name == doc_title):
                    key = f"doc:{c.document_id}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        used_citations.append(c)
                    break
    elif not document_specific and not combined_question:
        for c in all_citations:
            if c.source_type == "user_document" and c.service_name and c.service_name.lower() in text_lower:
                key = f"doc:{c.document_id}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    used_citations.append(c)

    # 2. Official service citations
    official_candidates = [c for c in all_citations if c.source_type == "official_service"]
    used_official: list[GovChatCitation] = []

    # Check if a specific service name is quoted in the answer text
    # e.g. "Based on the official information for 'Welcome to MeeSeva Portal':"
    # or "I found an official service called 'Seed Your AADHAAR'"
    quoted_matches: list[GovChatCitation] = []
    for c in official_candidates:
        name = (c.service_name or "").strip()
        if name and (f"'{name}'" in answer_text or f'"{name}"' in answer_text):
            quoted_matches.append(c)

    if quoted_matches:
        for c in quoted_matches:
            key = f"off:{c.source_url or c.service_name}"
            if key not in seen_keys:
                seen_keys.add(key)
                used_official.append(c)
    else:
        for c in official_candidates:
            name = (c.service_name or "").lower().strip()
            source_url = (c.source_url or "").lower().strip()

            name_used = bool(
                name and (
                    name in text_lower
                    or (len(name) > 6 and any(part.strip() in text_lower for part in name.split("|") if len(part.strip()) > 3))
                )
            )
            source_url_used = bool(source_url and source_url in text_lower)

            if name_used or source_url_used:
                key = f"off:{c.source_url or c.service_name}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    used_official.append(c)

    # Fallback for official context: if official hits were used but no candidate matched,
    # retain only the primary top hit
    if not used_official and official_candidates and (
        "official" in text_lower or "based on" in text_lower or "service" in text_lower
    ):
        top_c = official_candidates[0]
        key = f"off:{top_c.source_url or top_c.service_name}"
        if key not in seen_keys:
            seen_keys.add(key)
            used_official.append(top_c)

    used_citations.extend(used_official)
    return used_citations


async def answer_question(
    *,
    db: AsyncSession,
    user: User,
    question: str,
    lang: str,
    document_id: str | None,
    model_id: str | None,
    history: list[dict[str, str]] | None = None,
) -> AskResponse:
    """Classify user intent into one of 5 distinct routes and generate a grounded answer."""
    history = history or []
    
    context_query = question
    if history:
        # Prepend the previous user question to provide context for intent detection and retrieval
        prev_user = next((m.get("text", "") for m in reversed(history) if m.get("role") == "user"), None)
        if prev_user:
            context_query = f"{prev_user} {question}"
            
    documents = await retrieve_user_documents(db, user, context_query, document_id)
    has_active_doc = bool(documents.active_document)
    route = _classify_route(context_query, has_active_doc)

    # -----------------------------------------------------------------------
    # Route 1: LOCATION
    # -----------------------------------------------------------------------
    if route == AssistantRoute.LOCATION:
        return AskResponse(text=_LOCATION_ANSWER, citations=[], grounded=True)

    # -----------------------------------------------------------------------
    # Route 2: FRESHNESS
    # -----------------------------------------------------------------------
    if route == AssistantRoute.FRESHNESS:
        return AskResponse(text=_FRESHNESS_ANSWER, citations=[], grounded=False)

    # -----------------------------------------------------------------------
    # Route 3: DOCUMENT_ONLY
    # -----------------------------------------------------------------------
    if route == AssistantRoute.DOCUMENT_ONLY:
        provider = get_provider(model_id)
        try:
            if isinstance(provider, RuleBasedProvider):
                # Fallback natively handles the formatting for rule-based document responses
                answer = await provider.answer_question(
                    question, lang, documents.active_document, documents.documents if documents.has_matching_documents else []
                )
            else:
                answer = await provider.answer_question(
                    question, lang, documents.active_document, documents.documents if documents.has_matching_documents else [], grounded_context="", history=history)
        except httpx.HTTPError as exc:
            import logging
            logging.getLogger(__name__).exception("AI Provider failed")
            fallback = RuleBasedProvider()
            answer = await fallback.answer_question(
                question, lang, documents.active_document, documents.documents if documents.has_matching_documents else []
            )

        citations = _filter_used_citations(
            documents.citations, answer.text, documents.active_document, True, False, []
        )
        answer.citations = citations
        answer.grounded = bool(documents.active_document or documents.has_matching_documents)
        return answer

    # -----------------------------------------------------------------------
    # Route 4: COMBINED
    # -----------------------------------------------------------------------
    if route == AssistantRoute.COMBINED:
        official = await search_official_services(question, language=lang)
        candidates = [*documents.citations, *official.citations]
        provider = get_provider(model_id)
        try:
            if isinstance(provider, RuleBasedProvider):
                text = answer_combined_from_hits(documents.active_document, official.hits, question=question)
                if text:
                    used = _filter_used_citations(
                        candidates, text, documents.active_document, False, True, official.hits
                    )
                    return AskResponse(text=text, citations=used, grounded=True)
            answer = await provider.answer_question(
                question,
                lang,
                documents.active_document,
                documents.documents if documents.has_matching_documents else [],
                official.context, history=history)
        except httpx.HTTPError as exc:
            import logging
            logging.getLogger(__name__).exception("AI Provider failed")
            fallback = RuleBasedProvider()
            text = answer_combined_from_hits(documents.active_document, official.hits, question=question)
            if text:
                used = _filter_used_citations(
                    candidates, text, documents.active_document, False, True, official.hits
                )
                return AskResponse(text=text, citations=used, grounded=True)
            answer = await fallback.answer_question(
                question,
                lang,
                documents.active_document,
                documents.documents if documents.has_matching_documents else [],
            )

        answer.citations = _filter_used_citations(
            candidates, answer.text, documents.active_document, False, True, official.hits
        )
        answer.grounded = bool(official.hits or documents.active_document)
        return answer

    # -----------------------------------------------------------------------
    # Route 6: DOC_MATCH
    # -----------------------------------------------------------------------
    if route == AssistantRoute.DOC_MATCH:
        from app.services.ai.document_matcher import match_documents
        official = await search_official_services(question, language=lang)
        candidates = [*documents.citations, *official.citations]
        
        # Get uploaded document titles
        uploaded_titles = []
        if documents.active_document:
            title = documents.active_document.get("title", {}).get("en") or "Document"
            uploaded_titles.append(title)
        
        # We need to find the specific required_documents from official.hits
        reqs = []
        source_name = official.hits[0].service_name if official.hits else "the service"
        for hit in official.hits:
            if hit.required_documents:
                reqs = hit.required_documents
                source_name = hit.service_name
                break
                
        if not reqs:
            ctx_lines = [f"Official requirements list for {source_name} is missing. Please read the description:\n"]
            for hit in official.hits:
                ctx_lines.append(f"- {hit.service_name}: {hit.service_description}\n")
            ctx_lines.append("\nUploaded documents found:")
            for title in uploaded_titles:
                ctx_lines.append(f"- {title}")
            doc_match_context = "\n".join(ctx_lines)
        else:
            matches = match_documents(reqs, uploaded_titles)
            ctx_lines = [f"Official requirements for {source_name}:"]
            for req in reqs:
                ctx_lines.append(f"- {req}")
            ctx_lines.append("\nUploaded documents found:")
            for match in matches:
                state = match["state"]
                symbol = "✓" if state == "FOUND" else "?"
                ctx_lines.append(f"{symbol} {match['requirement']} — {state.replace('_', ' ').lower()}")
            doc_match_context = "\n".join(ctx_lines)
        
        provider = get_provider(model_id)
        try:
            if isinstance(provider, RuleBasedProvider):
                return AskResponse(text=doc_match_context, citations=candidates, grounded=True)
                
            answer = await provider.answer_question(
                question,
                lang,
                documents.active_document,
                [],
                doc_match_context, history=history)
        except httpx.HTTPError as exc:
            import logging
            logging.getLogger(__name__).exception("AI Provider failed")
            return AskResponse(text=doc_match_context, citations=candidates, grounded=True)

        answer.citations = _filter_used_citations(
            candidates, answer.text, documents.active_document, False, True, official.hits
        )
        answer.grounded = True
        return answer

    # -----------------------------------------------------------------------
    # Route 5: GOVERNMENT_ONLY
    # -----------------------------------------------------------------------
    official = await search_official_services(question, language=lang)
    if not official.hits:
        return AskResponse(text=_UNVERIFIED, citations=[], grounded=False)

    candidates = list(official.citations)
    provider = get_provider(model_id)
    try:
        if isinstance(provider, RuleBasedProvider):
            text = answer_from_official_hits(official.hits, question=question)
            if text:
                used = _filter_used_citations(
                    candidates, text, None, False, False, official.hits
                )
                return AskResponse(text=text, citations=used, grounded=True)
        answer = await provider.answer_question(
            question,
            lang,
            None,
            [],
            official.context, history=history)
    except httpx.HTTPError as exc:
        import logging
        logging.getLogger(__name__).exception("AI Provider failed")
        fallback = RuleBasedProvider()
        text = answer_from_official_hits(official.hits, question=question)
        if text:
            used = _filter_used_citations(
                candidates, text, None, False, False, official.hits
            )
            return AskResponse(text=text, citations=used, grounded=True)
        answer = await fallback.answer_question(
            question,
            lang,
            None,
            [],
        )

    answer.citations = _filter_used_citations(
        candidates, answer.text, None, False, False, official.hits
    )
    answer.grounded = bool(official.hits)
    return answer


