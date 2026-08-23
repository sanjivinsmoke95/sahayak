"""Unit tests for the document-intelligence engine (Phase 1: core intelligence)."""

from datetime import date
from types import SimpleNamespace

from app.services import document_intelligence as intel


def doc(slug: str, raw_text: str, title: str | None = None, is_sample: bool = False):
    return SimpleNamespace(
        slug=slug, raw_text=raw_text, title={"en": title or slug}, is_sample=is_sample
    )


TODAY = date(2026, 8, 18)

INCOME_VALID = (
    "GOVERNMENT OF INDIA DEPARTMENT OF REVENUE INCOME CERTIFICATE "
    "Date of issue 12 Aug 2026 Valid until 11 Aug 2027 "
    "Name RAMESH KUMAR Date of Birth 01/01/1990"
)
INCOME_EXPIRED = (
    "INCOME CERTIFICATE Date of issue 01 Jan 2020 Valid until 31 Dec 2020 "
    "Name RAMESH KUMAR"
)
AADHAAR = "GOVERNMENT OF INDIA Aadhaar UIDAI 1234 5678 9012 Name RAMESH KUMAR"
PAN = "INCOME TAX DEPARTMENT Permanent Account Number BXHPM1234K Name RAMESH K"
RATION = "Ration Card Government of Telangana Name RAMESH KUMAR"
RESIDENCE = "Residence Certificate Tahsildar Name RAMESH KUMAR"


# ----- validity -----

def test_validity_valid():
    v = intel.extract_validity(INCOME_VALID, today=TODAY)
    assert v["status"] == "valid"
    assert v["expiryDate"] == "2027-08-11"
    assert v["daysLeft"] and v["daysLeft"] > 300


def test_validity_expired():
    v = intel.extract_validity(INCOME_EXPIRED, today=TODAY)
    assert v["status"] == "expired"
    assert v["daysLeft"] is not None and v["daysLeft"] < 0


def test_validity_unknown_when_no_dates():
    v = intel.extract_validity("Just some text with no dates.", today=TODAY)
    assert v["status"] == "unknown"
    assert v["expiryDate"] is None


# ----- consistency -----

def test_consistency_name_mismatch():
    issues = intel.find_consistency_issues([doc("a", AADHAAR), doc("b", PAN)])
    assert any(i["type"] == "name_mismatch" for i in issues)
    name_issue = next(i for i in issues if i["type"] == "name_mismatch")
    assert name_issue["severity"] == "warning"
    assert set(name_issue["documents"]) == {"a", "b"}


def test_consistency_no_issue_when_names_match():
    issues = intel.find_consistency_issues([doc("a", AADHAAR), doc("b", RATION)])
    assert all(i["type"] != "name_mismatch" for i in issues)


def test_consistency_dob_mismatch():
    d1 = doc("a", "Name RAMESH KUMAR Date of Birth 01/01/1990")
    d2 = doc("b", "Name RAMESH KUMAR Date of Birth 02/02/1991")
    issues = intel.find_consistency_issues([d1, d2])
    assert any(i["type"] == "dob_mismatch" and i["severity"] == "high" for i in issues)


# ----- readiness -----

def test_readiness_missing_documents():
    r = intel.compute_readiness("income-certificate", [doc("a", AADHAAR)], today=TODAY)
    assert r["status"] == "not_ready"
    statuses = {req["label"]: req["status"] for req in r["requirements"]}
    assert statuses["Aadhaar card"] == "satisfied"
    assert statuses["Ration card"] == "missing"


def test_readiness_ready_when_all_satisfied():
    docs = [
        doc("a", AADHAAR),
        doc("b", RATION),
        doc("c", INCOME_VALID),
        doc("d", RESIDENCE),
    ]
    r = intel.compute_readiness("income-certificate", docs, today=TODAY)
    assert r["satisfied"] == 4
    assert r["status"] == "ready"
    assert r["score"] == 100


def test_readiness_expired_requirement():
    docs = [doc("a", AADHAAR), doc("b", RATION), doc("c", INCOME_EXPIRED), doc("d", RESIDENCE)]
    r = intel.compute_readiness("income-certificate", docs, today=TODAY)
    income_req = next(req for req in r["requirements"] if req["label"] == "Proof of income")
    assert income_req["status"] == "expired"
    assert r["status"] == "not_ready"


def test_readiness_unknown_service():
    assert intel.compute_readiness("no-such-service", [], today=TODAY) is None


def test_readiness_unknown_manual_requirement():
    # pension-renewal has "Filled renewal form" (no tags) -> unknown, not missing.
    docs = [
        doc("a", AADHAAR),
        doc("b", RATION + " passbook bank account"),
        doc("c", "Life certificate Jeevan Pramaan Name RAMESH KUMAR"),
    ]
    r = intel.compute_readiness("pension-renewal", docs, today=TODAY)
    form = next(req for req in r["requirements"] if req["label"] == "Filled renewal form")
    assert form["status"] == "unknown"


# ----- usable-for -----

def test_usable_for_matches():
    res = intel.usable_for(doc("c", INCOME_VALID), "income-certificate", today=TODAY)
    assert res["result"] == "likely_acceptable"
    assert res["requirement"] == "Proof of income"


def test_usable_for_does_not_satisfy():
    res = intel.usable_for(doc("p", PAN), "residence-certificate", today=TODAY)
    assert res["result"] == "does_not_satisfy"
    assert res["requirement"] is None
