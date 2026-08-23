"""
Helper extractors for individual fields.

Each function takes already-parsed primitives and returns verbatim (or lightly
normalised) data. They never invent values: absence -> None / [].

Phone/email/date extraction delegate to `validators` so normalisation lives in
one place; the public function names are kept for backward compatibility.
"""
from __future__ import annotations

import re

from extractor import validators
from extractor.text_cleaning import collapse_ws

# Keys in a key/value block that map onto scalar schema fields. Generic — these
# are semantic labels, not site-specific selectors.
_KV_FIELD_HINTS = {
    "fees": ("fee", "fees", "charges", "amount", "cost", "payment"),
    "processing_time": ("processing time", "time limit", "service time", "timeline",
                        "turn around", "turnaround", "delivery time"),
    "department": ("department", "ministry", "implementing agency", "nodal",
                   "issuing authority", "authority", "administered by"),
    "state": ("state", "state/ut", "applicable state"),
    "district": ("district", "taluk", "tehsil", "block", "mandal"),
    "validity": ("validity", "valid for", "valid up to", "valid till"),
    "renewal_information": ("renewal", "renew"),
    "ministry": ("ministry",),
    "authority": ("issuing authority", "competent authority", "authority", "issued by"),
}

_CATEGORY_TERMS = ("sc", "st", "obc", "ews", "bpl", "minority", "general category",
                   "scheduled caste", "scheduled tribe", "other backward")


def scalar_from_kv(kv_pairs: dict[str, str], field: str) -> str | None:
    """Find a scalar field value from key/value pairs (tables, dl, label:value)."""
    hints = _KV_FIELD_HINTS.get(field, ())
    for key, value in kv_pairs.items():
        k = key.lower()
        if any(h in k for h in hints):
            return value or None
    return None


# ---- Contact primitives (delegated to validators) ----
def extract_phones(text: str) -> list[str]:
    return validators.find_phones(text)


def extract_emails(text: str) -> list[str]:
    return validators.find_emails(text)


# ---- FAQ pairing ----
def faq_from_sections(text: str, list_items: list[str]) -> list[dict]:
    """
    Best-effort Q/A pairing under a FAQ heading. Handles both "Q: .. A: .." and
    alternating question/answer lines. Only emits pairs actually on the page.
    """
    faqs: list[dict] = []
    candidates = [c for c in (list_items or []) if c]
    if text:
        candidates.extend(
            s.strip() for s in re.split(r"(?<=[?.])\s+(?=[A-Z])", text) if s.strip()
        )
    q = None
    for item in candidates:
        is_q = item.endswith("?") or bool(re.match(r"^\s*Q[\.\)\:]", item, re.I))
        if is_q:
            q = re.sub(r"^\s*Q[\.\)\:]\s*", "", item).strip()
        elif q:
            answer = re.sub(r"^\s*A[\.\)\:]\s*", "", item).strip()
            if answer:
                faqs.append({"question": q, "answer": answer})
            q = None
    return faqs


# ---- Requirement parsing (age / income / category) ----
_AGE = re.compile(r"(\d{1,3}\s*(?:-|to)\s*\d{1,3}\s*years?|"
                  r"(?:above|over|below|under|minimum|maximum|at least|up to)\s*\d{1,3}\s*years?)", re.I)
_INCOME = re.compile(r"(?:income|salary).{0,40}?(?:₹|rs\.?|inr)?\s*[\d,]{3,}(?:\s*(?:per|/)\s*(?:year|annum|month))?", re.I)


def parse_age_requirement(text: str) -> str | None:
    m = _AGE.search(text or "")
    return collapse_ws(m.group(0)) if m else None


def parse_income_requirement(text: str) -> str | None:
    m = _INCOME.search(text or "")
    return collapse_ws(m.group(0)) if m else None


def parse_category_requirement(text: str) -> str | None:
    low = (text or "").lower()
    hits = [t.upper() if len(t) <= 4 else t.title() for t in _CATEGORY_TERMS if t in low]
    return ", ".join(dict.fromkeys(hits)) or None


# ---- Keywords & tags ----
_STOPWORDS = set("""a an the of for and or to in on at by with from is are be as your you this that
apply application service scheme government india state department official page""".split())
_WORD = re.compile(r"[A-Za-z][A-Za-z\-]{2,}")


def extract_keywords(*texts: str, limit: int = 12) -> list[str]:
    """Frequency-based salient terms (no external NLP). Deterministic."""
    freq: dict[str, int] = {}
    for t in texts:
        for w in _WORD.findall((t or "").lower()):
            if w in _STOPWORDS or len(w) < 4:
                continue
            freq[w] = freq.get(w, 0) + 1
    ranked = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
    return [w for w, _ in ranked[:limit]]


def build_tags(service_name: str, state: str | None, department: str | None) -> list[str]:
    tags: list[str] = []
    name = (service_name or "").lower()
    for kind in ("certificate", "licence", "license", "pension", "scholarship",
                 "scheme", "registration", "passport", "aadhaar", "ration"):
        if kind in name:
            tags.append(kind.replace("license", "licence"))
    if state:
        tags.append(state)
    if department:
        tags.append(department)
    return list(dict.fromkeys(tags))


# ---- Language detection (script-based; unchanged behaviour) ----
_SCRIPTS = {
    "hi": ((0x0900, 0x097F),),         # Devanagari (Hindi/Marathi)
    "te": ((0x0C00, 0x0C7F),),         # Telugu
    "ta": ((0x0B80, 0x0BFF),),         # Tamil
    "kn": ((0x0C80, 0x0CFF),),         # Kannada
    "ml": ((0x0D00, 0x0D7F),),         # Malayalam
    "bn": ((0x0980, 0x09FF),),         # Bengali
    "pa": ((0x0A00, 0x0A7F),),         # Gurmukhi (Punjabi)
    "gu": ((0x0A80, 0x0AFF),),         # Gujarati
}


def detect_language(text: str, default: str = "en") -> str:
    """Script-based language guess across the 10 supported languages."""
    if not text:
        return default
    counts = {code: 0 for code in _SCRIPTS}
    latin = 0
    for ch in text:
        o = ord(ch)
        if ch.isalpha() and o < 128:
            latin += 1
            continue
        for code, ranges in _SCRIPTS.items():
            if any(lo <= o <= hi for lo, hi in ranges):
                counts[code] += 1
                break
    total = latin + sum(counts.values())
    if total == 0:
        return default
    best = max(counts, key=counts.get)
    if counts[best] / total > 0.25:
        return best
    return "en"
