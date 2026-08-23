"""
Semantic classification of section labels to canonical schema fields.

Generic and site-agnostic: given a label (heading / accordion title / card title
/ definition term / bold pseudo-heading), return which field it feeds, or None.

Matching strategy (fast → fuzzy), transparent and deterministic:
  1. exact keyword substring        (cheap, high precision)
  2. token-subset overlap           (word order independent)
  3. difflib close-match fallback   (typos / minor variants), high threshold

No content is invented; classification only routes on-page text into buckets.
"""
from __future__ import annotations

import re
from difflib import SequenceMatcher

# Canonical field -> synonym phrases. Ordered by specificity (documents before
# the looser 'eligibility', etc.). Add synonyms here to support new layouts —
# never site-specific selectors.
_FIELD_KEYWORDS: dict[str, tuple[str, ...]] = {
    "required_documents": (
        "documents required", "required documents", "list of documents",
        "documents needed", "necessary documents", "supporting documents",
        "documents to be submitted", "enclosures", "document checklist", "document",
    ),
    "required_certificates": (
        "required certificates", "certificates required", "prerequisite certificates",
    ),
    "age_requirements": ("age requirement", "age criteria", "age limit", "minimum age", "maximum age"),
    "income_requirements": ("income requirement", "income criteria", "income limit", "income ceiling"),
    "category_requirements": ("caste category", "category criteria", "reservation", "target group", "target beneficiaries", "category"),
    "eligibility": (
        "eligibility criteria", "eligibility", "who can apply", "who is eligible",
        "eligible applicants", "eligible", "qualification", "pre-requisites",
        "prerequisites", "conditions for eligibility",
    ),
    "validity": ("validity period", "validity", "valid for", "period of validity"),
    "renewal_information": ("renewal process", "how to renew", "renewal of", "renewal"),
    "processing_time": (
        "processing time", "time limit", "service delivery time", "timeline",
        "turnaround time", "turn around time", "expected time", "time taken",
    ),
    "important_dates": ("important dates", "key dates", "last date", "deadline", "schedule"),
    "fees": ("fee structure", "application fee", "fees", "fee", "charges", "cost", "payment"),
    "online_process": ("apply online", "online process", "online application", "how to apply online"),
    "offline_process": ("apply offline", "offline process", "offline application", "how to apply offline"),
    "application_steps": (
        "how to apply", "application process", "application procedure",
        "steps to apply", "registration process", "method of application",
        "mode of application", "process flow", "procedure", "steps", "process",
    ),
    "benefits": ("scheme benefits", "benefits", "advantages", "what you get", "benefit"),
    "faq": ("frequently asked questions", "faqs", "faq", "common questions"),
    "contact": (
        "contact us", "contact details", "contact", "helpline", "help desk",
        "helpdesk", "grievance", "for more information", "whom to contact", "reach us",
    ),
    "ministry": ("nodal ministry", "ministry"),
    "authority": ("issuing authority", "competent authority", "implementing agency"),
    "description": (
        "about the scheme", "about the service", "about", "overview", "introduction",
        "description", "objective", "objectives", "summary", "details",
    ),
    "special_conditions": ("special conditions", "special provisions", "important note", "conditions", "note"),
}

_NON_WORD = re.compile(r"[^a-z0-9 ]+")


def _norm(label: str) -> str:
    return _NON_WORD.sub(" ", (label or "").lower()).strip()


def _tokens(s: str) -> set[str]:
    return {t for t in s.split() if t}


def classify_heading(label: str) -> str | None:
    """Return the canonical field for a section label, or None if unknown."""
    if not label:
        return None
    h = _norm(label)
    if not h:
        return None
    htokens = _tokens(h)

    # 1) exact substring (fast, precise)
    for field, keywords in _FIELD_KEYWORDS.items():
        for kw in keywords:
            if kw in h:
                return field

    # 2) token-subset overlap (word-order independent), for multi-word keywords
    for field, keywords in _FIELD_KEYWORDS.items():
        for kw in keywords:
            ktokens = _tokens(kw)
            if len(ktokens) >= 2 and ktokens <= htokens:
                return field

    # 3) fuzzy close-match fallback (typos / minor variants) — high threshold,
    #    only for short labels to avoid false positives on long sentences.
    if len(htokens) <= 4:
        best_field, best_ratio = None, 0.0
        for field, keywords in _FIELD_KEYWORDS.items():
            for kw in keywords:
                r = SequenceMatcher(None, h, kw).ratio()
                if r > best_ratio:
                    best_field, best_ratio = field, r
        if best_ratio >= 0.86:
            return best_field
    return None


_STEP_PREFIX = re.compile(r"^\s*(step\s*)?\d+[\.\)\:\-]\s*", re.IGNORECASE)


def clean_step(text: str) -> str:
    """Strip leading 'Step 1:' / '1.' numbering so steps read cleanly."""
    return _STEP_PREFIX.sub("", text).strip()
