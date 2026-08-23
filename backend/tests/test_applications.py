"""Unit tests for the application lifecycle (Phase 2: process management)."""

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.routers import applications as app_router
from app.schemas.application import ApplicationStatusUpdate
from app.services import application_service as apps


class FakeDb:
    async def flush(self) -> None:  # pragma: no cover - trivial
        return None


def test_is_valid_status():
    assert apps.is_valid_status("submitted")
    assert apps.is_valid_status("approved")
    assert not apps.is_valid_status("teleported")


def test_to_api_shape():
    app = SimpleNamespace(
        id="a1",
        service_id="income-certificate",
        status="preparing",
        notes=None,
        submitted_at=None,
        created_at=None,
        updated_at=None,
    )
    out = apps.to_api(app)
    assert out["id"] == "a1"
    assert out["serviceId"] == "income-certificate"
    assert out["status"] == "preparing"
    assert out["submittedAt"] is None


@pytest.mark.asyncio
async def test_update_status_records_event_and_sets_submitted_at():
    app = SimpleNamespace(status="preparing", submitted_at=None, events=[])
    await apps.update_status(FakeDb(), app, "submitted", note="sent at office")
    assert app.status == "submitted"
    assert app.submitted_at is not None  # submitted stamps the time
    assert len(app.events) == 1
    event = app.events[0]
    assert event.old_status == "preparing"
    assert event.new_status == "submitted"
    assert event.source == "user"
    assert event.note == "sent at office"


@pytest.mark.asyncio
async def test_update_status_non_submitted_leaves_timestamp_empty():
    app = SimpleNamespace(status="preparing", submitted_at=None, events=[])
    await apps.update_status(FakeDb(), app, "ready", note=None)
    assert app.status == "ready"
    assert app.submitted_at is None


@pytest.mark.asyncio
async def test_update_router_rejects_unknown_status():
    payload = ApplicationStatusUpdate(status="not-a-status")
    with pytest.raises(HTTPException) as error:
        await app_router.update_application("a1", payload, db=FakeDb(), user=SimpleNamespace(id="u1"))
    assert error.value.status_code == 422


@pytest.mark.asyncio
async def test_create_router_unknown_service_404(monkeypatch):
    async def fake_create(_db, _user, _service_id):
        return None

    monkeypatch.setattr(app_router.apps, "create_application", fake_create)
    with pytest.raises(HTTPException) as error:
        await app_router.create_application(
            SimpleNamespace(serviceId="nope"), db=FakeDb(), user=SimpleNamespace(id="u1")
        )
    assert error.value.status_code == 404
