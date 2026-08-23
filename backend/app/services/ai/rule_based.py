"""
The offline engine.

Ported from the prototype's mock so the app is fully usable with no API keys
and no network — which matters, because a demo in a hall with bad wifi is
still a demo. It answers from the extracted fields only, which also means it
can never hallucinate a deadline.
"""

from datetime import date
from typing import Any

from app.schemas import AskResponse
from app.services.ai.base import AIProvider

# Phrases the assistant uses, in all three languages.
A: dict[str, dict[str, str]] = {
    "greetBack": {
        "en": "Namaste. Ask me about any document you have added.",
        "hi": "नमस्ते। अपने किसी भी दस्तावेज़ के बारे में पूछिए।",
        "te": "నమస్తే. మీరు జోడించిన ఏ పత్రం గురించైనా అడగండి.",
    },
    "thanks": {
        "en": "Happy to help. Ask me anything else.",
        "hi": "मदद करके अच्छा लगा। और कुछ भी पूछिए।",
        "te": "సహాయం చేయడం సంతోషం. ఇంకేదైనా అడగండి.",
    },
    "langSwitched": {
        "en": "I have switched to English.",
        "hi": "मैंने हिन्दी में बदल दिया है।",
        "te": "నేను తెలుగుకు మార్చాను.",
    },
    "noDocOpen": {
        "en": "Open a document first, then I can answer about it.",
        "hi": "पहले कोई दस्तावेज़ खोलिए, फिर मैं उसके बारे में बता सकता हूँ।",
        "te": "ముందు ఒక పత్రాన్ని తెరవండి, అప్పుడు దాని గురించి చెప్పగలను.",
    },
    "nothingFound": {
        "en": "I could not find any document like that.",
        "hi": "मुझे ऐसा कोई दस्तावेज़ नहीं मिला।",
        "te": "అలాంటి పత్రం ఏదీ దొరకలేదు.",
    },
    "actionIntro": {
        "en": "These documents still need something from you:",
        "hi": "इन दस्तावेज़ों में आपका काम बाकी है:",
        "te": "ఈ పత్రాలలో మీ పని మిగిలి ఉంది:",
    },
    "monthIntro": {
        "en": "These have a date in the next 30 days:",
        "hi": "इनकी तारीख अगले 30 दिनों में है:",
        "te": "వీటి తేదీ రాబోయే 30 రోజుల్లో ఉంది:",
    },
    "catIntro": {
        "en": "Here is what I found:",
        "hi": "मुझे यह मिला:",
        "te": "నాకు ఇది దొరికింది:",
    },
    "deadlineIs": {
        "en": "The last date is {d}.",
        "hi": "अंतिम तारीख {d} है।",
        "te": "చివరి తేదీ {d}.",
    },
    "daysToGo": {
        "en": "That is {n} days from today.",
        "hi": "आज से {n} दिन बाकी हैं।",
        "te": "ఈ రోజు నుండి {n} రోజులు ఉన్నాయి.",
    },
    "needIntro": {
        "en": "You need these papers:",
        "hi": "आपको ये कागज़ चाहिए:",
        "te": "మీకు ఈ పత్రాలు కావాలి:",
    },
    "stepsIntro": {
        "en": "Do these, in this order:",
        "hi": "ये काम इसी क्रम में कीजिए:",
        "te": "ఈ పనులు ఇదే వరుసలో చేయండి:",
    },
    "whereIntro": {"en": "Submit it here:", "hi": "इसे यहाँ जमा कीजिए:", "te": "దీన్ని ఇక్కడ సమర్పించండి:"},
    "eligHint": {
        "en": "Open the document and use 'Does this apply to me?' to check.",
        "hi": "दस्तावेज़ खोलकर 'क्या यह मुझ पर लागू होता है?' से जाँचिए।",
        "te": "పత్రాన్ని తెరిచి 'ఇది నాకు వర్తిస్తుందా?' ద్వారా పరిశీలించండి.",
    },
    "notSure": {
        "en": "I am not sure about that one. You could ask:",
        "hi": "मुझे यह ठीक से समझ नहीं आया। आप पूछ सकते हैं:",
        "te": "అది నాకు సరిగ్గా అర్థం కాలేదు. మీరు ఇలా అడగవచ్చు:",
    },
    "noDeadline": {
        "en": "This document has no last date.",
        "hi": "इस दस्तावेज़ में कोई अंतिम तारीख नहीं है।",
        "te": "ఈ పత్రంలో చివరి తేదీ లేదు.",
    },
}

SUGGESTED: list[dict[str, str]] = [
    {"en": "What is this document?", "hi": "यह दस्तावेज़ क्या है?", "te": "ఈ పత్రం ఏమిటి?"},
    {"en": "What should I do now?", "hi": "मुझे अब क्या करना है?", "te": "నేను ఇప్పుడు ఏమి చేయాలి?"},
    {"en": "When is the last date?", "hi": "अंतिम तारीख कब है?", "te": "చివరి తేదీ ఎప్పుడు?"},
    {"en": "Which papers do I need?", "hi": "मुझे कौन से कागज़ चाहिए?", "te": "నాకు ఏ పత్రాలు కావాలి?"},
]

# Order matters: the first list that matches wins, so specific phrases must be
# tested before broad keywords.
#
# "What is this document?" is the first question the app suggests, and the
# broad `need` list below contains "document" / "दस्तावेज़". Without this
# entry ahead of it, tapping that chip answers "You need these papers:" in
# English and Hindi — a bug carried over from the prototype.
INTENT_WORDS: list[tuple[str, list[str]]] = [
    (
        "what",
        [
            "what is this",
            "what is the document",
            "यह क्या है",
            "यह दस्तावेज़ क्या है",
            "ఇది ఏమిటి",
            "ఈ పత్రం ఏమిటి",
        ],
    ),
    ("lang_te", ["telugu", "తెలుగు", "तेलुगु"]),
    ("lang_hi", ["hindi", "हिन्दी", "हिंदी"]),
    ("lang_en", ["english", "अंग्रेज़ी", "अंग्रेजी", "ఇంగ్లీష", "ఆంగ్ల"]),
    ("search_action", ["need action", "action needed", "pending", "बाकी", "పని మిగిలి", "చర్య"]),
    ("search_month", ["this month", "next 30", "30 days", "इस महीने", "ఈ నెల", "30 రోజు"]),
    ("cat_pension", ["pension", "पेंशन", "పింఛను", "పింఛన"]),
    ("cat_property", ["tax", "property", "कर", "संपत्ति", "పన్ను", "ఆస్తి"]),
    ("cat_education", ["scholarship", "education", "छात्रवृत्ति", "శిక్ష", "స్కాలర్", "విద్య"]),
    ("cat_identity", ["income certificate", "identity", "आय प्रमाण", "पहचान", "గుర్తింపు"]),
    ("cat_scheme", ["scheme", "yojana", "योजना", "పథకం"]),
    (
        "deadline",
        ["deadline", "last date", "due", "when", "date", "तारीख", "कब", "अंतिम", "తేదీ", "గడువు"],
    ),
    ("need", ["paper", "document", "papers", "documents", "कागज़", "दस्तावेज़", "పత్రాల", "కాగితా"]),
    ("where", ["where", "submit", "office", "कहाँ", "जमा", "ఎక్కడ", "సమర్పి", "కార్యాలయ"]),
    ("elig", ["eligib", "apply to me", "qualify", "पात्र", "लागू", "అర్హ", "వర్తిస"]),
    ("ifnot", ["if i do not", "if i don", "ignore", "do nothing", "न करूँ", "చేయకపోతే"]),
    ("steps", ["what should i do", "next step", "steps", "करना", "कदम", "చేయాలి", "దశ"]),
    ("why", ["why", "received", "क्यों", "मिला", "ఎందుకు", "వచ్చింది"]),
    ("what", ["what is this", "what is", "explain", "meaning", "क्या है", "समझा", "ఏమిటి", "వివరించ"]),
    ("thanks", ["thank", "धन्यवाद", "शुक्रिया", "ధన్యవాద"]),
    ("greet", ["hello", "hi ", "namaste", "नमस्ते", "నమస్తే", "హలో"]),
]


def detect_intent(question: str) -> str:
    q = (question or "").lower()
    for intent, words in INTENT_WORDS:
        if any(word in q for word in words):
            return intent
    return "unknown"


def _pick(value: dict[str, str] | None, lang: str) -> str:
    if not value:
        return ""
    return value.get(lang) or value.get("en", "")


def _days_until(iso: str | None) -> int | None:
    if not iso:
        return None
    try:
        return (date.fromisoformat(iso) - date.today()).days
    except ValueError:
        return None


class RuleBasedProvider(AIProvider):
    """Answers strictly from extracted fields. Never invents anything."""

    name = "rule-based"

    async def answer_question(
        self,
        question: str,
        lang: str,
        document: dict[str, Any] | None,
        documents: list[dict[str, Any]],
    ) -> AskResponse:
        intent = detect_intent(question)

        if intent.startswith("lang_"):
            target = intent.split("_")[1]
            return AskResponse(text=_pick(A["langSwitched"], target), setLang=target)  # type: ignore[arg-type]

        if intent == "greet":
            return AskResponse(text=_pick(A["greetBack"], lang))
        if intent == "thanks":
            return AskResponse(text=_pick(A["thanks"], lang))

        if intent in {"search_action", "search_month"} or intent.startswith("cat_"):
            found = documents
            intro = _pick(A["catIntro"], lang)

            if intent.startswith("cat_"):
                category = intent.split("_", 1)[1]
                found = [d for d in documents if d.get("cat") == category]
            elif intent == "search_action":
                found = [d for d in documents if d.get("status") == "action"]
                intro = _pick(A["actionIntro"], lang)
            else:
                found = [
                    d
                    for d in documents
                    if (days := _days_until(d.get("deadline"))) is not None and 0 <= days <= 30
                ]
                intro = _pick(A["monthIntro"], lang)

            if not found:
                return AskResponse(text=_pick(A["nothingFound"], lang))
            return AskResponse(text=intro, docRefs=[d["id"] for d in found])

        if not document:
            return AskResponse(
                text=_pick(A["noDocOpen"], lang),
                list=[_pick(s, lang) for s in SUGGESTED[:3]],
            )

        if intent == "deadline":
            deadline = document.get("deadline")
            if not deadline:
                return AskResponse(text=_pick(A["noDeadline"], lang))
            days = max(_days_until(deadline) or 0, 0)
            date_text = _pick(A["deadlineIs"], lang).replace("{d}", deadline)
            days_text = _pick(A["daysToGo"], lang).replace("{n}", str(days))
            return AskResponse(text=f"{date_text} {days_text}")

        if intent == "need":
            return AskResponse(
                text=_pick(A["needIntro"], lang),
                list=[_pick(n, lang) for n in document.get("need", [])],
            )

        if intent == "steps":
            return AskResponse(
                text=_pick(A["stepsIntro"], lang),
                list=[_pick(s, lang) for s in document.get("steps", [])],
            )

        if intent == "where":
            return AskResponse(
                text=f"{_pick(A['whereIntro'], lang)} {_pick(document.get('where'), lang)}"
            )

        if intent == "ifnot":
            return AskResponse(text=_pick(document.get("ifNot"), lang))
        if intent == "why":
            return AskResponse(text=_pick(document.get("why"), lang))
        if intent == "what":
            return AskResponse(
                text=f"{_pick(document.get('what'), lang)} {_pick(document.get('why'), lang)}"
            )
        if intent == "elig":
            return AskResponse(text=_pick(A["eligHint"], lang))

        return AskResponse(
            text=_pick(A["notSure"], lang),
            list=[_pick(s, lang) for s in SUGGESTED],
        )

    async def analyze_document(self, text: str, filename: str) -> dict[str, Any]:
        """
        Without a language model there is no honest way to read an arbitrary
        notice, so the caller falls back to a sample and labels it as such
        rather than inventing an analysis.
        """
        raise NotImplementedError("Rule-based engine cannot analyse free-form documents")
