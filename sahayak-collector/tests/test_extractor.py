"""
Unit tests for the parse -> extract pipeline.

These run WITHOUT a database, network or browser — they validate that the
deterministic extraction correctly maps a realistic government service page onto
the ServiceRecord schema, and that missing fields stay null (no hallucination).

Run:  pytest -q
"""
from extractor.service_extractor import ServiceExtractor

SAMPLE_HTML = """
<html><head><title>Income Certificate</title></head><body><main>
<h1>Income Certificate</h1>
<p>An Income Certificate certifies the annual income of a family.</p>
<h2>Eligibility</h2>
<ul><li>Permanent resident of the state.</li></ul>
<h2>Documents Required</h2>
<ul><li>Aadhaar Card</li><li>Ration Card</li></ul>
<h2>How to Apply</h2>
<ol><li>Step 1: Register on the portal.</li><li>Step 2: Submit the form.</li></ol>
<table><tr><th>Fee</th><td>Rs. 15</td></tr>
<tr><th>Processing Time</th><td>7 working days</td></tr></table>
<a href="/forms/income.pdf">Income Form</a>
</main></body></html>
"""


def _record():
    return ServiceExtractor(source_name="test", default_state="Kerala").extract(
        SAMPLE_HTML, "https://edistrict.kerala.gov.in/income"
    )


def test_core_fields_extracted():
    rec = _record()
    assert rec.service_name == "Income Certificate"
    assert rec.state == "Kerala"
    assert rec.fees == "Rs. 15"
    assert rec.processing_time == "7 working days"


def test_lists_extracted():
    rec = _record()
    assert "Aadhaar Card" in rec.required_documents
    assert rec.eligibility == ["Permanent resident of the state."]
    assert rec.application_steps == ["Register on the portal.", "Submit the form."]


def test_forms_and_hash():
    rec = _record()
    assert rec.forms[0].url.endswith("/forms/income.pdf")
    assert rec.content_hash and len(rec.content_hash) == 64


def test_missing_fields_are_null_not_hallucinated():
    minimal = "<html><body><main><h1>Caste Certificate</h1></main></body></html>"
    rec = ServiceExtractor().extract(minimal, "https://x.gov.in/caste")
    assert rec.service_name == "Caste Certificate"
    assert rec.fees is None
    assert rec.processing_time is None
    assert rec.eligibility == []
    assert rec.required_documents == []


def test_non_service_page_returns_none():
    rec = ServiceExtractor().extract("<html><body></body></html>", "https://x.gov.in/")
    assert rec is None
