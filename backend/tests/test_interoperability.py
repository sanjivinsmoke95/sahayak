"""End-to-end interoperability tests (SIH26129 acceptance criteria).

Exercises the real flow through the running app: citizen API -> consent ->
sync engine -> connectors -> five mock government systems (over HTTP via
ASGITransport) -> per-system results -> retry -> audit history.

Requires a reachable database (the app's Postgres). When none is available the
whole module skips, so it is safe to run anywhere; the pure-logic coverage in
test_interop_unit.py always runs.
"""

import uuid
from types import SimpleNamespace

import httpx
import pytest
import pytest_asyncio
from httpx import ASGITransport
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.api.deps import get_current_user, get_db
from app.config import settings
from app.database import Base
from app.database.session import _async_url
from app.main import app
from app.models import User
from app.services.interoperability import sync_service

pytestmark = pytest.mark.asyncio

HYDERABAD = {
    "line1": "12-3-45, Ashok Nagar", "city": "Hyderabad",
    "state": "Telangana", "pincode": "500020",
}
VIJAYAWADA = {
    "line1": "8-24, Governorpet", "city": "Vijayawada",
    "state": "Andhra Pradesh", "pincode": "520002",
}
ALL_SYSTEMS = ["aadhaar", "pan", "rto", "passport", "voter"]


@pytest_asyncio.fixture
async def client(monkeypatch):
    # A fresh engine per test with NullPool: the module engine's pooled asyncpg
    # connections are bound to the loop that first used them, which breaks under
    # pytest's per-test event loops. NullPool opens/closes each connection, so
    # the engine works on whatever loop this test runs on.
    engine = create_async_engine(_async_url(settings.database_url), poolclass=NullPool)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception:
        await engine.dispose()
        pytest.skip("database not reachable")

    session_factory = async_sessionmaker(engine, expire_on_commit=False, autoflush=False)

    async def override_get_db():
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    # users.id is VARCHAR(36), so the id is a bare uuid; the test marker rides
    # on clerk_id (VARCHAR 255).
    user_id = str(uuid.uuid4())
    async with session_factory() as db:
        db.add(User(
            id=user_id,
            clerk_id=f"interop-test-{uuid.uuid4()}",
            email="interop@test.local",
            display_name="Test Citizen",
        ))
        await db.commit()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=user_id, display_name="Test Citizen"
    )
    # Route the connectors' outbound calls back into this same app in-process,
    # so no live server is needed but the API boundary is genuinely crossed.
    monkeypatch.setattr(
        sync_service,
        "make_client",
        lambda: httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api"),
    )

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test/api") as http:
        yield http

    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)
    async with session_factory() as db:
        await db.execute(delete(User).where(User.id == user_id))
        await db.commit()
    await engine.dispose()


async def _systems(http) -> dict[str, dict]:
    res = await http.get("/interoperability/systems")
    assert res.status_code == 200
    return {s["system"]: s for s in res.json()}


async def test_address_update_propagates_to_all_five(client):
    """Test 1 — Hyderabad -> Vijayawada, 5/5 systems updated."""
    res = await client.put(
        "/interoperability/address",
        json={"value": VIJAYAWADA, "targets": ALL_SYSTEMS, "consent": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["status"] == "success"
    outcomes = {r["system"]: r["status"] for r in body["results"]}
    assert outcomes == {s: "success" for s in ALL_SYSTEMS}

    # Every independent system now holds the new city.
    systems = await _systems(client)
    for system in ALL_SYSTEMS:
        assert systems[system]["address"]["city"] == "Vijayawada"

    # And the citizen's own canonical profile changed too.
    profile = (await client.get("/interoperability/profile")).json()
    assert profile["address"]["city"] == "Vijayawada"


async def test_phone_update_propagates_to_all_five(client):
    """Test 2 — phone change, 5/5 systems updated."""
    res = await client.put(
        "/interoperability/phone",
        json={"value": "9000000001", "targets": ALL_SYSTEMS, "consent": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    systems = await _systems(client)
    for system in ALL_SYSTEMS:
        assert systems[system]["phone"] == "9000000001"


async def test_partial_failure_then_retry(client):
    """Tests 3 & 4 — one system offline -> 4/5, then retry -> 5/5."""
    # Take Passport offline (demo lever).
    off = await client.post("/interoperability/systems/passport/simulate", json={"online": False})
    assert off.status_code == 200 and off.json()["isOnline"] is False

    res = await client.put(
        "/interoperability/address",
        json={"value": VIJAYAWADA, "targets": ALL_SYSTEMS, "consent": True},
    )
    body = res.json()
    assert body["status"] == "partial"
    assert body["success"] is False
    outcomes = {r["system"]: r["status"] for r in body["results"]}
    assert outcomes["passport"] == "failed"
    assert sum(1 for s in outcomes.values() if s == "success") == 4
    batch_id = body["batchId"]

    # Passport keeps its old value; the other four advanced.
    systems = await _systems(client)
    assert systems["passport"]["address"]["city"] != "Vijayawada"
    assert systems["aadhaar"]["address"]["city"] == "Vijayawada"

    # Bring Passport back and retry only the failed system.
    await client.post("/interoperability/systems/passport/simulate", json={"online": True})
    retry = await client.post(f"/interoperability/sync/{batch_id}/retry")
    rbody = retry.json()
    assert rbody["status"] == "success"
    assert rbody["success"] is True
    passport = next(r for r in rbody["results"] if r["system"] == "passport")
    assert passport["status"] == "success"
    assert passport["attempts"] == 2  # first failed, retry succeeded

    systems = await _systems(client)
    assert systems["passport"]["address"]["city"] == "Vijayawada"


async def test_consent_denied_updates_nothing(client):
    """Test 5 — consent refused, no connected system is touched."""
    before = await _systems(client)
    res = await client.put(
        "/interoperability/address",
        json={"value": VIJAYAWADA, "targets": ALL_SYSTEMS, "consent": False},
    )
    body = res.json()
    assert body["status"] == "denied"
    assert body["success"] is False
    assert body["results"] == []

    after = await _systems(client)
    for system in ALL_SYSTEMS:
        assert after[system]["address"] == before[system]["address"]
    # Canonical profile also unchanged (still the seed city).
    profile = (await client.get("/interoperability/profile")).json()
    assert profile["address"]["city"] == "Hyderabad"


async def test_audit_history_records_change(client):
    """Test 6 — the audit trail captures field, values, consent and results."""
    await client.put(
        "/interoperability/phone",
        json={"value": "9111122223", "targets": ALL_SYSTEMS, "consent": True},
    )
    history = (await client.get("/interoperability/history")).json()
    assert len(history) >= 1
    latest = history[0]
    assert latest["field"] == "phone"
    assert latest["consented"] is True
    assert latest["status"] == "success"
    assert len(latest["results"]) == 5
    # Stored phone is masked in the audit record, never the raw number.
    assert "X" in str(latest["newValue"])
    assert latest["newValue"] != "9111122223"
