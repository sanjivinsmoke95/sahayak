"""
The scheme knowledge layer — 3,400+ government schemes from the myScheme
dataset, loaded once and served for search, detail and matching.

Provenance is preserved on every record (source, sourceType, status,
officialUrl) and surfaced in the UI: this is authoritative *reference* data,
not verified live official data, so it is labelled "needs verification" and
never presented as a final government decision.
"""

import json
from pathlib import Path
from typing import Any

SEED = Path(__file__).resolve().parents[3] / "database" / "seed" / "schemes.json"


def _load() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if not SEED.exists():
        # Search other candidate locations (Docker mounts the seed at /app).
        for parent in Path(__file__).resolve().parents:
            candidate = parent / "database" / "seed" / "schemes.json"
            if candidate.is_file():
                data = json.loads(candidate.read_text(encoding="utf-8"))
                return data.get("schemes", []), data.get("meta", {})
        return [], {}
    data = json.loads(SEED.read_text(encoding="utf-8"))
    return data.get("schemes", []), data.get("meta", {})


SCHEMES, META = _load()
BY_ID: dict[str, dict[str, Any]] = {s["id"]: s for s in SCHEMES}
CATEGORIES: list[str] = sorted({s.get("category", "Other") for s in SCHEMES})


def get_scheme(scheme_id: str) -> dict[str, Any] | None:
    return BY_ID.get(scheme_id)


def search_schemes(
    q: str | None = None,
    category: str | None = None,
    level: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> dict[str, Any]:
    query = (q or "").strip().lower()
    results = SCHEMES
    if category:
        results = [s for s in results if s.get("category") == category]
    if level:
        results = [s for s in results if s.get("level", "").lower() == level.lower()]
    if query:
        terms = query.split()
        scored: list[tuple[int, dict[str, Any]]] = []
        for s in results:
            haystack = (
                f"{s.get('name','')} {s.get('summary','')} "
                f"{' '.join(s.get('tags', []))} {s.get('category','')}"
            ).lower()
            score = sum(haystack.count(t) for t in terms)
            if score:
                scored.append((score, s))
        scored.sort(key=lambda x: -x[0])
        results = [s for _, s in scored]

    total = len(results)
    page = results[offset : offset + limit]
    return {"total": total, "results": page}


def match_schemes(user_tags: set[str], limit: int = 12) -> list[dict[str, Any]]:
    """
    Schemes the reader may be able to use, matched by the documents they have.

    A scheme is surfaced only when at least one of its required-document tags is
    satisfied by an uploaded document — grounded, ranked by how much is covered.
    """
    matched: list[dict[str, Any]] = []
    for s in SCHEMES:
        req = set(s.get("requirementTags", []))
        if not req:
            continue
        have = req & user_tags
        if not have:
            continue
        missing = req - user_tags
        matched.append(
            {
                "id": s["id"],
                "name": s["name"],
                "category": s.get("category", "Other"),
                "level": s.get("level", "State"),
                "benefit": s.get("benefit", ""),
                "satisfied": len(have),
                "total": len(req),
                "matchedTags": sorted(have),
                "missingTags": sorted(missing),
                "officialUrl": s.get("officialUrl"),
                "source": s.get("source", "myScheme"),
                "status": s.get("status", "needs_verification"),
            }
        )
    matched.sort(key=lambda m: (-m["satisfied"], m["total"] - m["satisfied"]))
    return matched[:limit]
