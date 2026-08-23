"""Unit tests for scheme discovery + profile shaping (Phase 4)."""

from types import SimpleNamespace

from app.services import discover
from app.services import profile_service as profiles


def doc(slug: str, raw_text: str):
    return SimpleNamespace(slug=slug, raw_text=raw_text, title={"en": slug}, is_sample=False)


AADHAAR = "GOVERNMENT OF INDIA Aadhaar UIDAI 1234 5678 9012 Name RAMESH KUMAR"
INCOME = "INCOME CERTIFICATE Name RAMESH KUMAR annual income = 2,40,000"


def test_discovery_surfaces_relevant_services_ranked():
    result = discover.discover_services([doc("a", AADHAAR), doc("b", INCOME)])
    services = result["services"]
    assert len(services) >= 1
    # Income Certificate has two matches (Aadhaar + Proof of income) -> ranked first.
    assert services[0]["serviceId"] == "income-certificate"
    assert services[0]["satisfied"] == 2
    # Every surfaced service has at least one matching document.
    assert all(s["satisfied"] >= 1 for s in services)


def test_discovery_empty_when_no_matching_documents():
    result = discover.discover_services([doc("x", "a holiday photo with nothing official")])
    assert result["services"] == []


def test_profile_to_api_shape():
    p = SimpleNamespace(id="p1", name="Amma", relationship_label="mother", is_self=False)
    out = profiles.to_api(p)
    assert out == {"id": "p1", "name": "Amma", "relationship": "mother", "isSelf": False}
