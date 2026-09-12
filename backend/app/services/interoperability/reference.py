"""Optional reference data from data.gov.in — never a dependency.

Used only to enrich the address form: given a pincode, suggest the city/state.
With no ``DATA_GOV_API_KEY`` configured, or on any error, this returns an
"unavailable" result and the interoperability flow proceeds unchanged. The
demonstration does not require it and must never block on it.
"""

import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# All-India pincode directory published on data.gov.in.
_RESOURCE_ID = "6176ee09-3d56-4a3b-8115-21841576b2f6"
_ENDPOINT = "https://api.data.gov.in/resource/" + _RESOURCE_ID


def _unavailable(pincode: str) -> dict[str, Any]:
    return {"available": False, "pincode": pincode, "city": None, "state": None}


async def lookup_pincode(pincode: str) -> dict[str, Any]:
    pincode = (pincode or "").strip()
    if not settings.data_gov_enabled or not pincode.isdigit() or len(pincode) != 6:
        return _unavailable(pincode)
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.get(
                _ENDPOINT,
                params={
                    "api-key": settings.data_gov_api_key,
                    "format": "json",
                    "filters[pincode]": pincode,
                    "limit": 1,
                },
            )
        response.raise_for_status()
        records = response.json().get("records") or []
        if not records:
            return _unavailable(pincode)
        record = records[0]
        return {
            "available": True,
            "pincode": pincode,
            "city": record.get("district") or record.get("regionname"),
            "state": record.get("statename") or record.get("state"),
        }
    except Exception as exc:  # noqa: BLE001 - best effort only
        logger.info("pincode reference lookup skipped: %s", exc)
        return _unavailable(pincode)
