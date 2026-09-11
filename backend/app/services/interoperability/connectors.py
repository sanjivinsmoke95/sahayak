"""Connectors: one per government system, talking over a real API boundary.

Every mock system speaks the same wire contract, so the HTTP mechanics live in
``HttpGovernmentConnector`` exactly once and each system is a one-line subclass
that only sets ``system``. The synchronization engine owns the workflow; a
connector owns nothing but the conversation with its own system. This keeps the
five-system fan-out from being five copies of the same orchestration.

The connectors call the mock systems over HTTP (httpx) rather than in-process
functions, so the demonstration genuinely exercises a service boundary. The
client is injected: at runtime it targets ``MOCK_GOV_BASE_URL``; in tests it is
an httpx client wired to the app via ASGITransport, so no server is required.
"""

from __future__ import annotations

import abc
from typing import Any

import httpx

from app.config import settings
from app.models.interoperability import GOV_SYSTEMS


class ConnectorError(Exception):
    """A single system's update failed. Carries a short, safe reason."""

    def __init__(self, message: str, status: int | None = None) -> None:
        super().__init__(message)
        self.status = status


class GovernmentConnector(abc.ABC):
    """The contract the synchronization engine depends on."""

    system: str

    @abc.abstractmethod
    async def update_address(self, citizen_id: str, address: dict[str, Any]) -> dict[str, Any]:
        ...

    @abc.abstractmethod
    async def update_phone(self, citizen_id: str, phone: str) -> dict[str, Any]:
        ...


class HttpGovernmentConnector(GovernmentConnector):
    """Shared HTTP implementation. Subclasses set only ``system``."""

    system = ""

    def __init__(self, client: httpx.AsyncClient) -> None:
        self._client = client

    def _headers(self) -> dict[str, str]:
        # Presents the shared secret to the mock system when one is configured,
        # modelling system-to-system authentication. Harmless when blank.
        if settings.mock_gov_api_key:
            return {"X-Gov-Api-Key": settings.mock_gov_api_key}
        return {}

    async def _put(self, citizen_id: str, kind: str, payload: dict[str, Any]) -> dict[str, Any]:
        path = f"/mock-gov/{self.system}/citizen/{citizen_id}/{kind}"
        try:
            response = await self._client.put(path, json=payload, headers=self._headers())
        except httpx.HTTPError as exc:  # network / transport failure
            raise ConnectorError(f"{self.system} is unreachable") from exc

        if response.status_code >= 400:
            detail = _safe_detail(response)
            raise ConnectorError(detail, response.status_code)
        return response.json()

    async def update_address(self, citizen_id: str, address: dict[str, Any]) -> dict[str, Any]:
        return await self._put(citizen_id, "address", {"address": address})

    async def update_phone(self, citizen_id: str, phone: str) -> dict[str, Any]:
        return await self._put(citizen_id, "phone", {"phone": phone})


def _safe_detail(response: httpx.Response) -> str:
    """A short reason from the response, never the payload we sent."""
    try:
        body = response.json()
        if isinstance(body, dict) and body.get("detail"):
            return str(body["detail"])[:180]
    except Exception:  # noqa: BLE001 - body may not be JSON
        pass
    if response.status_code == 503:
        return "system offline"
    return f"HTTP {response.status_code}"


class AadhaarConnector(HttpGovernmentConnector):
    system = "aadhaar"


class PanConnector(HttpGovernmentConnector):
    system = "pan"


class RtoConnector(HttpGovernmentConnector):
    system = "rto"


class PassportConnector(HttpGovernmentConnector):
    system = "passport"


class VoterConnector(HttpGovernmentConnector):
    system = "voter"


_REGISTRY: dict[str, type[HttpGovernmentConnector]] = {
    cls.system: cls
    for cls in (
        AadhaarConnector,
        PanConnector,
        RtoConnector,
        PassportConnector,
        VoterConnector,
    )
}

# Fail fast if the model's system list and the connector registry drift apart.
assert set(_REGISTRY) == set(GOV_SYSTEMS), "connector registry out of sync with GOV_SYSTEMS"


def build_connector(system: str, client: httpx.AsyncClient) -> GovernmentConnector:
    try:
        return _REGISTRY[system](client)
    except KeyError as exc:
        raise ConnectorError(f"unknown system {system!r}") from exc


def make_client() -> httpx.AsyncClient:
    """The runtime client the connectors use, targeting the mock systems."""
    return httpx.AsyncClient(base_url=settings.mock_gov_base_url, timeout=10.0)
