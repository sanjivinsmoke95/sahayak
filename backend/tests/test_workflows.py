"""Unit tests for advanced document workflows (Phase 3)."""

from types import SimpleNamespace

from app.services import document_workflows as flows


def doc(slug: str, raw_text: str, title: str | None = None):
    return SimpleNamespace(slug=slug, raw_text=raw_text, title={"en": title or slug})


# ----- rejection explainer -----

REJECTION_WITH_REASON = (
    "APPLICATION REJECTED. Your application has been rejected. "
    "Reason: the submitted Income Certificate has expired and does not satisfy the validity "
    "requirement. For queries contact 9876543210 or appeals@example.gov.in"
)


def test_rejection_detected_with_reason():
    r = flows.analyze_rejection(REJECTION_WITH_REASON)
    assert r["isRejection"] is True
    assert r["reasonStated"] is True
    assert "income certificate" in r["reason"].lower()
    assert any("updated" in a.lower() for a in r["suggestedActions"])
    assert "income certificate" in r["relatedDocuments"]
    assert "9876543210" in r["appeal"]["phones"]
    assert "appeals@example.gov.in" in r["appeal"]["emails"]


def test_rejection_reason_not_stated():
    r = flows.analyze_rejection("Your application has been rejected.")
    assert r["isRejection"] is True
    assert r["reasonStated"] is False
    assert r["reason"] is None
    # A closing safe action is always present.
    assert len(r["suggestedActions"]) >= 1


def test_not_a_rejection():
    r = flows.analyze_rejection("This is an Income Certificate valid for official purposes.")
    assert r["isRejection"] is False


# ----- verification signals -----

def test_verification_signals():
    text = (
        "GOVERNMENT OF INDIA Certificate No : 1C/2025/47892 "
        "This document is digitally signed. Verify at https://verify.example.gov.in QR code below."
    )
    result = flows.verification_signals(text)
    signals = {s["type"]: s for s in result["signals"]}
    assert signals["certificate_number"]["detected"] is True
    assert signals["certificate_number"]["value"].endswith("892")  # masked, tail kept
    assert "1C/2025" not in (signals["certificate_number"]["value"] or "")
    assert signals["issuing_authority"]["detected"] is True
    assert signals["digital_signature"]["detected"] is True
    assert signals["verification_url"]["detected"] is True
    assert signals["qr_code"]["detected"] is True


def test_verification_no_signals():
    result = flows.verification_signals("random text with nothing official")
    signals = {s["type"]: s for s in result["signals"]}
    assert signals["certificate_number"]["detected"] is False
    assert signals["issuing_authority"]["detected"] is False


# ----- form assistant -----

FORM = (
    "APPLICATION FORM — Please fill the following. "
    "Name: ____ Father's Name: ____ Date of Birth: ____ Annual Income: ____ "
    "Aadhaar Number: ____ Mobile: ____ Signature of applicant: ____"
)


def test_form_detected_and_suggestions_from_documents():
    documents = [
        doc("a", "Aadhaar UIDAI Name RAMESH KUMAR 1234 5678 9012 Mobile 9876543210"),
        doc("b", "INCOME CERTIFICATE annual income = 2,40,000 Name RAMESH KUMAR", "Income Certificate"),
    ]
    result = flows.analyze_form(FORM, documents)
    assert result["isForm"] is True
    fields = {f["key"]: f for f in result["fields"]}
    assert fields["name"]["suggestedValue"] == "RAMESH KUMAR"
    assert fields["annualIncome"]["suggestedValue"] == "2,40,000"
    assert fields["aadhaar"]["sensitive"] is True
    # A field with no source stays empty rather than being invented.
    assert "father" in fields


def test_not_a_form():
    result = flows.analyze_form("This is a pension renewal notice with a deadline.", [])
    assert result["isForm"] is False
