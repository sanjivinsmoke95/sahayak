"""
Sentence-embedding provider (lazy singleton).

Uses sentence-transformers. The model is loaded once on first use so importing
this module is cheap (important: Scrapy imports pipelines eagerly).
"""
from __future__ import annotations

from functools import lru_cache

from config.settings import settings


@lru_cache(maxsize=1)
def _get_model():
    # Imported lazily so the heavy torch import only happens when embeddings
    # are actually needed.
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.embedding_model)


def embed(text: str) -> list[float]:
    """Embed a single string into a list[float] of length settings.embedding_dim."""
    model = _get_model()
    vec = model.encode(text or "", normalize_embeddings=True)
    return vec.tolist()


def service_text(record) -> str:
    """
    Build the text used to embed a service. Concatenates the fields a user is
    most likely to ask about so semantic search matches natural questions like
    "I need an income certificate".
    """
    parts = [
        record.service_name,
        record.department or "",
        record.state or "",
        record.description or "",
        " ".join(record.eligibility),
        " ".join(record.required_documents),
    ]
    return " \n ".join(p for p in parts if p)
