"""
Regression tests for document classification.

These lock in the fix for the "everything is a Pension Document" bug: an
incidental mention of a scheme must never override what a document actually is,
and structural types (forms, rejections) must not be read as a certificate/ID.
"""

from app.services.classification import classify_document


def _type(text: str) -> str:
    return classify_document(text)["docType"]


def test_income_certificate_mentioning_pension_is_income():
    text = (
        "GOVERNMENT OF INDIA DEPARTMENT OF REVENUE INCOME CERTIFICATE "
        "annual income 2,40,000 valid for scholarship and pension schemes Name RAHUL DEMO"
    )
    assert _type(text) == "Income Certificate"


def test_pan_is_pan():
    assert _type("INCOME TAX DEPARTMENT Permanent Account Number Card DEMOP1234K") == "PAN Card"


def test_caste_certificate_mentioning_pension_is_caste():
    text = "CASTE CERTIFICATE certify community for education, pension and welfare benefits"
    assert _type(text) == "Caste Certificate"


def test_application_form_with_aadhaar_field_is_form():
    text = (
        "SCHOLARSHIP APPLICATION FORM Please fill Name Father's Name Date of Birth "
        "Annual Income Aadhaar Number Mobile Signature of applicant"
    )
    assert _type(text) == "Application Form"


def test_rejection_mentioning_pension_is_rejection():
    text = "SCHOLARSHIP DEPARTMENT Your application has been rejected. cannot be combined with a pension."
    assert _type(text) == "Rejection Notice"


def test_real_pension_notice_is_pension():
    text = (
        "PENSION DEPARTMENT Annual verification and renewal of pension records. "
        "Beneficiaries drawing monthly pension must furnish a life certificate. PPO Number 44871"
    )
    assert _type(text) == "Pension Document"


def test_aadhaar_is_aadhaar():
    assert _type("GOVERNMENT OF INDIA Aadhaar UIDAI 1234 5678 9012") == "Aadhaar Card"


def test_bare_pension_word_alone_does_not_force_pension():
    # "pension" as an ordinary word, no pension-specific phrase -> not a pension doc.
    text = "This government office also handles queries about the pension helpline number."
    assert _type(text) != "Pension Document"
