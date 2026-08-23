"""
Build Sahayak's scheme knowledge layer from the myScheme dataset.

Pipeline: raw CSV  ->  normalize  ->  dedupe  ->  extract requirement tags  ->
provenance  ->  compact application dataset (database/seed/schemes.json).

The source is a scrape of myScheme.gov.in. It is authoritative *reference*
information, NOT verified live official data, so every record is stamped
source="myScheme", sourceType="dataset", status="needs_verification" and the
UI surfaces that. Required documents are extracted from the free text; they can
be wrong or stale, which is exactly why they are labelled for verification.

Usage:
    python scripts/build_schemes.py /path/to/updated_data.csv
"""

import csv
import json
import re
import sys
from datetime import date
from pathlib import Path

OUT = Path(__file__).resolve().parents[1].parents[0] / "database" / "seed" / "schemes.json"
MYSCHEME_URL = "https://www.myscheme.gov.in/schemes/{slug}"

# Free-text document phrase -> Sahayak requirement tag (same vocabulary the
# document classifier and readiness engine use, so uploads can satisfy them).
DOC_TAG_RULES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"aadha?ar", re.I), "aadhaar"),
    (re.compile(r"income certificate|income proof|proof of income", re.I), "income"),
    (re.compile(r"caste certificate|community certificate", re.I), "caste"),
    (re.compile(r"residen|domicile|address proof|nativity", re.I), "residence"),
    (re.compile(r"ration card", re.I), "ration"),
    (re.compile(r"bank (account|passbook|details)|passbook", re.I), "bank"),
    (re.compile(r"birth certificate", re.I), "birth"),
    (re.compile(r"death certificate", re.I), "death"),
    (re.compile(r"disability|divyang|handicap", re.I), "disability"),
    (re.compile(r"\bpan\b", re.I), "pan"),
    (re.compile(r"caste.*community|community.*caste", re.I), "caste"),
]

# Split a "documents" blob into individual items.
_SPLIT = re.compile(r"[.;\n•]|(?<=[a-z])(?=[A-Z][a-z])")


def clean(text: str, limit: int) -> str:
    text = (text or "").replace("﻿", " ").strip().strip('"').strip()
    text = re.sub(r"\s+", " ", text)
    if len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0].rstrip(",;. ") + "…"
    return text


def parse_documents(blob: str) -> tuple[list[str], list[str]]:
    """Return (short cleaned document list, requirement tags)."""
    blob = (blob or "").replace("﻿", " ")
    items: list[str] = []
    for part in _SPLIT.split(blob):
        part = re.sub(r"\s+", " ", part or "").strip(" ,-")
        if 3 < len(part) < 90 and part.lower() not in {"and", "etc", "any other documents as required"}:
            items.append(part)
    # dedupe preserving order, cap
    seen, docs = set(), []
    for it in items:
        key = it.lower()
        if key not in seen:
            seen.add(key)
            docs.append(it)
        if len(docs) >= 8:
            break

    tags: list[str] = []
    for rule, tag in DOC_TAG_RULES:
        if rule.search(blob) and tag not in tags:
            tags.append(tag)
    return docs, tags


def main(csv_path: str) -> None:
    rows_out: dict[str, dict] = {}
    with open(csv_path, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            slug = (row.get("slug") or "").strip()
            name = clean(row.get("scheme_name", ""), 140)
            if not slug or not name or slug in rows_out:
                continue
            docs, tags = parse_documents(row.get("documents", ""))
            categories = [c.strip() for c in (row.get("schemeCategory") or "").split(",") if c.strip()]
            rows_out[slug] = {
                "id": slug,
                "name": name,
                "summary": clean(row.get("details", ""), 260),
                "benefit": clean(row.get("benefits", ""), 200),
                "category": categories[0] if categories else "Other",
                "categories": categories[:3],
                "level": (row.get("level") or "").strip() or "State",
                "requiredDocuments": docs,
                "requirementTags": tags,
                "tags": [t.strip() for t in (row.get("tags") or "").split(",") if t.strip()][:8],
                "officialUrl": MYSCHEME_URL.format(slug=slug),
                "source": "myScheme",
                "sourceType": "dataset",
                "status": "needs_verification",
            }

    payload = {
        "meta": {
            "source": "myScheme (myscheme.gov.in)",
            "sourceType": "dataset",
            "note": "Reference information scraped from myScheme; requires official verification.",
            "version": 1,
            "builtOn": date.today().isoformat(),
            "count": len(rows_out),
        },
        "schemes": list(rows_out.values()),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {len(rows_out)} schemes -> {OUT}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/sahayak_schemes/updated_data.csv")
