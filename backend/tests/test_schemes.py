"""Tests for the myScheme knowledge layer (search, detail, matching, provenance)."""

from app.services import scheme_catalog as catalog


def test_catalog_loaded():
    assert len(catalog.SCHEMES) > 1000  # the myScheme dataset is thousands of schemes
    assert catalog.CATEGORIES


def test_every_scheme_has_provenance():
    for s in catalog.SCHEMES[:200]:
        assert s["source"] == "myScheme"
        assert s["status"] == "needs_verification"
        assert s["officialUrl"].startswith("https://www.myscheme.gov.in/schemes/")


def test_search_returns_results():
    out = catalog.search_schemes(q="scholarship", limit=5)
    assert out["total"] >= 1
    assert len(out["results"]) >= 1
    assert all("scholarship" in (s["name"] + s["summary"]).lower() or s["category"] for s in out["results"])


def test_get_scheme_by_id():
    first = catalog.SCHEMES[0]
    got = catalog.get_scheme(first["id"])
    assert got is not None and got["id"] == first["id"]
    assert catalog.get_scheme("no-such-scheme") is None


def test_match_schemes_is_grounded():
    # A reader with an income certificate + aadhaar should match schemes that
    # require those, and never a scheme with no matching tag.
    matches = catalog.match_schemes({"income", "aadhaar"}, limit=10)
    assert matches, "expected at least one matched scheme"
    for m in matches:
        assert m["satisfied"] >= 1
        assert {"income", "aadhaar"} & set(m["matchedTags"])
        assert m["source"] == "myScheme"


def test_match_schemes_empty_when_no_tags():
    assert catalog.match_schemes(set()) == []
