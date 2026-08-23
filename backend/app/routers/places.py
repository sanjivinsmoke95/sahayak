"""
Mee Seva centre finder.

The Google Places search runs here, on the server, so the key that can spend
money never reaches the browser. The frontend sends only a coordinate and gets
back a clean list of nearby centres with the distance already computed. An
optional, referrer-restricted browser key is handed out separately for drawing
the interactive map; when it is absent the app falls back to a list-only view.
"""

import math

import httpx
from fastapi import APIRouter, Query

from app.config import settings

router = APIRouter(prefix="/places", tags=["places"])

_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"


@router.get("/config")
async def maps_config() -> dict:
    """
    What the client needs to know before drawing anything.

    `enabled` is true when either a browser key (client-side search + map) or a
    server key (server proxy) is configured. Only the browser-safe key is ever
    returned to the page.
    """
    return {
        "enabled": bool(settings.google_maps_browser_key or settings.google_maps_api_key),
        "browserKey": settings.google_maps_browser_key or None,
    }


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
    )
    return round(radius * 2 * math.asin(math.sqrt(a)), 2)


@router.get("/mee-seva")
async def mee_seva_centres(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: int = Query(6000, ge=500, le=50000),
) -> dict:
    """Nearby Mee Seva centres for a coordinate, nearest first."""
    if not settings.maps_enabled:
        # No key configured: tell the client so it can show a friendly note
        # rather than an error, and still offer a plain Google Maps link.
        return {"enabled": False, "results": []}

    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "keyword": "Meeseva center",
        "key": settings.google_maps_api_key,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(_NEARBY_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError:
        return {"enabled": True, "error": "unreachable", "results": []}

    status = data.get("status")
    if status not in ("OK", "ZERO_RESULTS"):
        # Do not leak Google's raw error to the browser; log-free, generic.
        return {"enabled": True, "error": "search_failed", "results": []}

    results = []
    for place in data.get("results", []):
        location = place.get("geometry", {}).get("location", {})
        p_lat, p_lng = location.get("lat"), location.get("lng")
        if p_lat is None or p_lng is None:
            continue
        results.append(
            {
                "name": place.get("name", ""),
                "address": place.get("vicinity", ""),
                "lat": p_lat,
                "lng": p_lng,
                "openNow": place.get("opening_hours", {}).get("open_now"),
                "rating": place.get("rating"),
                "distanceKm": _haversine_km(lat, lng, p_lat, p_lng),
            }
        )

    results.sort(key=lambda r: r["distanceKm"])
    return {"enabled": True, "results": results[:20]}
