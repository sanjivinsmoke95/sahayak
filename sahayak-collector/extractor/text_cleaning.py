"""
Text cleaning & normalisation utilities used across extraction.

Deterministic, dependency-light. Removes boilerplate, collapses whitespace,
de-duplicates repeated lines, and normalises bullet/label text — WITHOUT
altering the factual content of a field.
"""
from __future__ import annotations

import re

_WS = re.compile(r"\s+")
_BULLET = re.compile(r"^\s*(?:[•▪◦‣·*\-–—o]|•|\d+[.)]|\([a-z0-9]+\))\s+", re.IGNORECASE)

# Lines that are almost always navigation / boilerplate noise, not content.
_BOILERPLATE = (
    "cookie", "we use cookies", "accept all", "privacy policy", "terms of use",
    "skip to main content", "screen reader", "text size", "font size",
    "last updated", "visitor count", "you are here", "sitemap", "back to top",
    "print this page", "share this", "follow us", "subscribe", "newsletter",
    "all rights reserved", "copyright", "©", "powered by", "designed and developed",
    "log in", "sign in", "register here", "toggle navigation", "main menu",
)


def collapse_ws(text: str) -> str:
    """Collapse ALL whitespace (incl. newlines) to single spaces."""
    return _WS.sub(" ", (text or "").replace("\xa0", " ")).strip()


def strip_bullet(text: str) -> str:
    """Remove a leading bullet / numbering marker from a list item."""
    return _BULLET.sub("", text or "").strip()


def is_boilerplate(line: str) -> bool:
    low = (line or "").strip().lower()
    if not low:
        return True
    if len(low) < 3:
        return True
    return any(b in low for b in _BOILERPLATE)


def clean_line(text: str) -> str:
    return strip_bullet(collapse_ws(text))


def clean_list(items: list[str]) -> list[str]:
    """Clean, drop boilerplate/empties, and de-duplicate preserving order."""
    out: list[str] = []
    seen: set[str] = set()
    for raw in items or []:
        line = clean_line(raw)
        if not line or is_boilerplate(line):
            continue
        key = line.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(line)
    return out


def dedupe_paragraphs(text: str) -> str:
    """Remove exact repeated sentences/paragraphs while keeping order."""
    if not text:
        return ""
    parts = re.split(r"(?<=[.?!])\s+", collapse_ws(text))
    seen: set[str] = set()
    out: list[str] = []
    for p in parts:
        k = p.lower().strip()
        if k and k not in seen:
            seen.add(k)
            out.append(p.strip())
    return " ".join(out)


def first_sentence(text: str) -> str:
    text = collapse_ws(text)
    m = re.search(r"^(.*?[.?!])(?:\s|$)", text)
    return (m.group(1) if m else text).strip()


_SENT_SPLIT = re.compile(r"[;\n]|(?<=[.?!])\s+(?=[A-Z0-9])")


def split_sentences(text: str) -> list[str]:
    """Split prose into sentence-like chunks (for 'lists as paragraphs')."""
    text = collapse_ws(text)
    if not text:
        return []
    return [p.strip() for p in _SENT_SPLIT.split(text) if len(p.strip()) > 2]
