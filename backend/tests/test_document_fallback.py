from app.services.document_service import basic_analysis


def test_residence_certificate_fallback_populates_all_reader_sections() -> None:
    result = basic_analysis(
        "Government of Telangana Residence Certificate. Verify at https://www.tg.meeseva.gov.in/",
        "residence.pdf",
    )

    assert result["title"]["en"] == "Residence Certificate"
    assert result["issuer"]["en"] == "Government of Telangana"
    assert result["steps"]
    assert result["need"]
    assert "verify" in result["where"]["en"].lower()
