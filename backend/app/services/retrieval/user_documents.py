"""Private, user-scoped retrieval over existing analysed-document fields."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas.services import GovChatCitation
from app.services import document_service as docs

_STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "about", "apply", "application",
    "by", "can", "card", "certificate", "check", "cost", "details", "do",
    "does", "document", "documents", "fee", "fees", "for", "from", "get",
    "give", "govt", "government", "help", "how", "i", "if", "in", "info",
    "information", "is", "it", "know", "me", "my", "need", "not", "of",
    "office", "offline", "on", "online", "or", "paper", "papers", "please",
    "procedure", "process", "required", "requirements", "scheme", "service",
    "show", "status", "tell", "that", "the", "this", "to", "verify", "was",
    "were", "what", "when", "where", "which", "who", "why", "with"
}


@dataclass
class UserDocumentRetrieval:
    documents: list[dict[str, Any]] = field(default_factory=list)
    active_document: dict[str, Any] | None = None
    citations: list[GovChatCitation] = field(default_factory=list)
    has_matching_documents: bool = False


def _tokens(text: str) -> set[str]:
    return {token for token in re.findall(r"[\w-]{2,}", text.lower()) if token not in _STOP_WORDS}


def _title_text(document: dict[str, Any]) -> str:
    title = document.get("title", {})
    return " ".join(title.values()) if isinstance(title, dict) else str(title or "")


def _searchable_text(document: dict[str, Any]) -> str:
    localized = lambda value: " ".join(value.values()) if isinstance(value, dict) else ""
    parts = [
        localized(document.get("title")),
        localized(document.get("what")),
        localized(document.get("why")),
        localized(document.get("where")),
        localized(document.get("ifNot")),
        localized(document.get("explain")),
    ]
    for key in ("steps", "need"):
        parts.extend(localized(item) for item in document.get(key, []) if isinstance(item, dict))
    return " ".join(str(part) for part in parts)


async def retrieve_user_documents(
    db: AsyncSession,
    user: User,
    question: str,
    active_document_id: str | None,
    *,
    limit: int = 3,
) -> UserDocumentRetrieval:
    """Select relevant records from a query that is always filtered by ``user.id``."""
    authorized = await docs.get_user_documents(db, user)
    api_documents: list[dict[str, Any]] = []
    for doc_model in authorized:
        doc_slug = getattr(doc_model, "slug", getattr(doc_model, "id", None))
        is_active = bool(active_document_id and (doc_slug == active_document_id or str(doc_slug) == active_document_id))
        try:
            api_doc = docs.to_api(doc_model, detailed=is_active)
        except TypeError:
            api_doc = docs.to_api(doc_model)
        api_documents.append(api_doc)
    active = next(
        (document for document in api_documents if document.get("id") == active_document_id), None
    )
    wanted = _tokens(question)

    def _score(doc: dict[str, Any]) -> int:
        title_matches = len(wanted.intersection(_tokens(_title_text(doc))))
        content_matches = len(wanted.intersection(_tokens(_searchable_text(doc))))
        return title_matches * 3 + content_matches

    matching_ids = {
        document["id"]
        for document in api_documents
        if wanted and (
            wanted.intersection(_tokens(_title_text(document)))
            or len(wanted.intersection(_tokens(_searchable_text(document)))) >= 2
        )
    }

    ranked = sorted(
        [doc for doc in api_documents if _score(doc) > 0],
        key=_score,
        reverse=True,
    )
    selected: list[dict[str, Any]] = []
    if active:
        selected.append(active)
    for document in ranked:
        if document not in selected and len(selected) < limit:
            selected.append(document)

    citation_docs = [doc for doc in selected if doc["id"] in matching_ids or doc["id"] == active_document_id]

    return UserDocumentRetrieval(
        documents=selected,
        active_document=active,
        has_matching_documents=bool(matching_ids),
        citations=[
            GovChatCitation(
                service_name=document.get("title", {}).get("en", "Saved document"),
                source_type="user_document",
                document_id=document["id"],
            )
            for document in citation_docs
        ],
    )
