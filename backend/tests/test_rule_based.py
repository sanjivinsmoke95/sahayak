"""
The offline engine is what answers when there is no API key and no signal,
so it is the part that most needs a test.
"""

import pytest

from app.services.ai.rule_based import RuleBasedProvider, detect_intent

DOCUMENT = {
    "id": "pension",
    "cat": "pension",
    "status": "action",
    "title": {"en": "Pension Renewal Notice", "hi": "", "te": ""},
    "deadline": "2030-01-31",
    "what": {"en": "A renewal notice.", "hi": "", "te": ""},
    "why": {"en": "Because your pension is due for renewal.", "hi": "", "te": ""},
    "where": {"en": "The pension office.", "hi": "", "te": ""},
    "ifNot": {"en": "Your pension may stop.", "hi": "", "te": ""},
    "steps": [{"en": "Collect the form", "hi": "", "te": ""}],
    "need": [{"en": "Aadhaar card", "hi": "", "te": ""}],
}


@pytest.mark.parametrize(
    ("question", "expected"),
    [
        ("When is the last date?", "deadline"),
        ("Which papers do I need?", "need"),
        ("Where do I submit it?", "where"),
        ("What should I do now?", "steps"),
        ("What is this document?", "what"),
        ("यह दस्तावेज़ क्या है?", "what"),
        ("Explain this in Telugu", "lang_te"),
        ("thank you", "thanks"),
    ],
)
def test_detect_intent(question: str, expected: str) -> None:
    assert detect_intent(question) == expected


@pytest.mark.anyio
async def test_deadline_answer_uses_the_document() -> None:
    provider = RuleBasedProvider()
    answer = await provider.answer_question("When is the last date?", "en", DOCUMENT, [DOCUMENT])
    assert "2030-01-31" in answer.text


@pytest.mark.anyio
async def test_papers_answer_lists_requirements() -> None:
    provider = RuleBasedProvider()
    answer = await provider.answer_question("Which papers do I need?", "en", DOCUMENT, [DOCUMENT])
    assert answer.bullets == ["Aadhaar card"]


@pytest.mark.anyio
async def test_language_switch_is_reported_to_the_client() -> None:
    provider = RuleBasedProvider()
    answer = await provider.answer_question("Explain this in Telugu", "en", DOCUMENT, [DOCUMENT])
    assert answer.setLang == "te"


@pytest.mark.anyio
async def test_without_an_open_document_it_offers_suggestions() -> None:
    provider = RuleBasedProvider()
    answer = await provider.answer_question("What is this?", "en", None, [])
    assert answer.bullets


@pytest.mark.anyio
async def test_bullets_are_named_list_on_the_wire() -> None:
    """The frontend reads `list`; Python cannot use that name as a field."""
    provider = RuleBasedProvider()
    answer = await provider.answer_question("Which papers do I need?", "en", DOCUMENT, [DOCUMENT])
    payload = answer.model_dump(by_alias=True)
    assert payload["list"] == ["Aadhaar card"]
