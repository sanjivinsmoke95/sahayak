"""Content hashing for change-detection and dedup."""
from __future__ import annotations

import hashlib
import re


_WS = re.compile(r"\s+")


def normalise_text(text: str) -> str:
    """Collapse whitespace so trivial formatting changes don't trigger updates."""
    return _WS.sub(" ", (text or "")).strip().lower()


def content_hash(*parts: str) -> str:
    """Stable SHA-256 over the normalised concatenation of parts."""
    joined = "".join(normalise_text(p) for p in parts if p)
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()
