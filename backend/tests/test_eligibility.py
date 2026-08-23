from app.schemas import EligibilityProfile
from app.services.eligibility import check_eligibility

RULES = {
    "minAge": 60,
    "maxIncome": 300_000,
    "note": {"en": "Confirm at the office named in your document.", "hi": "", "te": ""},
}


def test_meeting_every_condition_reads_as_likely() -> None:
    result = check_eligibility(RULES, EligibilityProfile(age="65", income="i2"), "en")
    assert result.verdict == "likely"


def test_a_failed_condition_is_never_reported_as_likely() -> None:
    result = check_eligibility(RULES, EligibilityProfile(age="45", income="i2"), "en")
    assert result.verdict == "no"


def test_missing_answers_stay_hedged() -> None:
    result = check_eligibility(RULES, EligibilityProfile(), "en")
    assert result.verdict == "maybe"
    assert any(reason.k == "unknown" for reason in result.reasons)
