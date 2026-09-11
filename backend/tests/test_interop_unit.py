"""Pure-logic unit tests for the interoperability layer — no DB, always run."""

from types import SimpleNamespace

import httpx
import pytest

from app.models.interoperability import GOV_SYSTEMS
from app.services.interoperability import canonical, sync_service
from app.services.interoperability.connectors import (
    _REGISTRY,
    ConnectorError,
    build_connector,
)


def test_mask_phone_hides_middle():
    assert canonical.mask_phone("9876543210") == "98XXXXXX10"
    assert canonical.mask_phone("+91 98765 43210") == "91XXXXXXXX10"
    assert canonical.mask_phone("123") == "•••"


def test_normalise_address_fills_all_keys():
    out = canonical.normalise_address({"city": "  Hyderabad ", "state": "Telangana"})
    assert out == {"line1": "", "city": "Hyderabad", "state": "Telangana", "pincode": ""}
    # Non-dict input degrades to empty canonical shape, never raises.
    assert canonical.normalise_address("nonsense")["city"] == ""


def test_address_summary():
    assert canonical.address_summary(
        {"city": "Vijayawada", "state": "Andhra Pradesh", "pincode": "520001"}
    ) == "Vijayawada, Andhra Pradesh 520001"


def test_stored_value_masks_phone_only():
    assert canonical.stored_value("phone", "9876543210") == "98XXXXXX10"
    assert canonical.stored_value("address", {"city": "X"})["city"] == "X"


def test_recompute_status_aggregation():
    def batch(*statuses):
        return SimpleNamespace(results=[SimpleNamespace(status=s) for s in statuses], status="")

    b = batch("success", "success")
    sync_service._recompute_status(b)
    assert b.status == "success"

    b = batch("success", "failed")
    sync_service._recompute_status(b)
    assert b.status == "partial"

    b = batch("failed", "failed")
    sync_service._recompute_status(b)
    assert b.status == "failed"


def test_connector_registry_matches_systems():
    assert set(_REGISTRY) == set(GOV_SYSTEMS)


def test_build_connector_unknown_raises():
    client = httpx.AsyncClient()
    with pytest.raises(ConnectorError):
        build_connector("interpol", client)


def test_batch_to_response_shape():
    batch = SimpleNamespace(
        id="b1",
        field="address",
        status="partial",
        results=[
            SimpleNamespace(system="aadhaar", status="success", error=None, attempts=1),
            SimpleNamespace(system="passport", status="failed", error="system offline", attempts=1),
        ],
    )
    out = sync_service.batch_to_response(batch)
    assert out["batchId"] == "b1"
    assert out["success"] is False
    assert out["status"] == "partial"
    assert out["results"][0]["label"] == "Aadhaar"
    assert out["results"][1]["error"] == "system offline"
