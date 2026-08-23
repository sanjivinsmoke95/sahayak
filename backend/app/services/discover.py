"""
Scheme discovery: which services the reader could pursue given the documents
they already have. Grounded in real matches — a service is only surfaced when
at least one of its required papers is already present, and readiness is
reused so nothing is invented. This never says "you are eligible".
"""

from typing import Any

from app.services.document_intelligence import compute_readiness
from app.services.service_catalog import SERVICES


def discover_services(documents: list[Any]) -> dict[str, Any]:
    results: list[dict[str, Any]] = []

    for service_id in SERVICES:
        readiness = compute_readiness(service_id, documents)
        if readiness is None:
            continue

        satisfied = [r for r in readiness["requirements"] if r["status"] == "satisfied"]
        # Only surface a service the reader has at least one paper for.
        if not satisfied:
            continue

        missing = [r for r in readiness["requirements"] if r["status"] in ("missing", "unknown")]
        results.append(
            {
                "serviceId": service_id,
                "status": "ready" if readiness["status"] == "ready" else "likely_relevant",
                "score": readiness["score"],
                "satisfied": len(satisfied),
                "total": readiness["total"],
                "missingCount": len(missing),
            }
        )

    # Most-ready first.
    results.sort(key=lambda r: (r["status"] != "ready", -r["satisfied"]))
    return {"services": results}
