"""
Compares what someone told us with the conditions printed in their notice.

Deliberately hedged. This never states an official decision, because it is not
entitled to one — it reports what the document asks for and what the reader
said, and sends them to the office named in the notice.
"""

import json
from pathlib import Path

from app.schemas import EligibilityProfile, EligibilityReason, EligibilityResponse

OPTIONS_PATH = (
    Path(__file__).resolve().parents[3] / "database" / "seed" / "eligibility_options.json"
)


def _load_income_values() -> dict[str, int]:
    """
    The income bands are read from the same file the frontend is built from,
    so a band cannot be changed in the UI without the checker following it.
    """
    if not OPTIONS_PATH.exists():
        return {"i1": 80_000, "i2": 200_000, "i3": 550_000, "i4": 1_200_000}
    with OPTIONS_PATH.open(encoding="utf-8") as handle:
        options = json.load(handle)
    return {band["id"]: band["value"] for band in options.get("incomes", [])}


INCOME_VALUES: dict[str, int] = _load_income_values()

MESSAGES: dict[str, dict[str, str]] = {
    "age_unknown": {
        "en": "You did not tell us your age, so we could not check the age condition.",
        "hi": "आपने उम्र नहीं बताई, इसलिए उम्र की शर्त जाँच नहीं सके।",
        "te": "మీరు వయస్సు చెప్పలేదు, కాబట్టి వయస్సు షరతును పరిశీలించలేకపోయాము.",
    },
    "age_stated": {
        "en": "Your age is {a}. The document asks for {m} years or more.",
        "hi": "आपकी उम्र {a} है। दस्तावेज़ में {m} साल या उससे ज़्यादा माँगा गया है।",
        "te": "మీ వయస్సు {a}. పత్రంలో {m} సంవత్సరాలు లేదా ఎక్కువ అడిగారు.",
    },
    "age_too_high": {
        "en": "This document is meant for younger applicants.",
        "hi": "यह दस्तावेज़ कम उम्र के आवेदकों के लिए है।",
        "te": "ఈ పత్రం చిన్న వయస్సు దరఖాస్తుదారుల కోసం.",
    },
    "income_unknown": {
        "en": "You did not tell us your income, so we could not check the income condition.",
        "hi": "आपने आय नहीं बताई, इसलिए आय की शर्त जाँच नहीं सके।",
        "te": "మీరు ఆదాయం చెప్పలేదు, కాబట్టి ఆదాయ షరతును పరిశీలించలేకపోయాము.",
    },
    "income_ok": {
        "en": "Your income is within the limit written in the document.",
        "hi": "आपकी आय दस्तावेज़ में लिखी सीमा के भीतर है।",
        "te": "మీ ఆదాయం పత్రంలో రాసిన పరిమితిలోపే ఉంది.",
    },
    "income_high": {
        "en": "Your income appears higher than the limit written in the document.",
        "hi": "आपकी आय दस्तावेज़ में लिखी सीमा से ज़्यादा लगती है।",
        "te": "మీ ఆదాయం పత్రంలో రాసిన పరిమితి కంటే ఎక్కువగా ఉన్నట్లుంది.",
    },
    "work_ok": {
        "en": "What you do matches the people this document is meant for.",
        "hi": "आप जो करते हैं वह उन लोगों से मेल खाता है जिनके लिए यह दस्तावेज़ है।",
        "te": "మీరు చేసే పని ఈ పత్రం ఉద్దేశించిన వారితో సరిపోతుంది.",
    },
    "work_no": {
        "en": "This document is written for a different group of people.",
        "hi": "यह दस्तावेज़ किसी दूसरे समूह के लिए लिखा गया है।",
        "te": "ఈ పత్రం వేరే వర్గం వారి కోసం రాయబడింది.",
    },
}


def _msg(key: str, lang: str, **values: object) -> str:
    text = MESSAGES[key].get(lang) or MESSAGES[key]["en"]
    for name, value in values.items():
        text = text.replace("{" + name + "}", str(value))
    return text


def check_eligibility(rules: dict, profile: EligibilityProfile, lang: str) -> EligibilityResponse:
    reasons: list[EligibilityReason] = []
    fails = passes = unknowns = 0

    min_age = rules.get("minAge")
    if min_age is not None:
        if not profile.age:
            unknowns += 1
            reasons.append(EligibilityReason(k="unknown", t=_msg("age_unknown", lang)))
        else:
            text = _msg("age_stated", lang, a=profile.age, m=min_age)
            if int(profile.age) >= int(min_age):
                passes += 1
                reasons.append(EligibilityReason(k="ok", t=text))
            else:
                fails += 1
                reasons.append(EligibilityReason(k="no", t=text))

    max_age = rules.get("maxAge")
    if max_age is not None and profile.age:
        if int(profile.age) <= int(max_age):
            passes += 1
        else:
            fails += 1
            reasons.append(EligibilityReason(k="no", t=_msg("age_too_high", lang)))

    max_income = rules.get("maxIncome")
    if max_income is not None:
        value = INCOME_VALUES.get(profile.income)
        if value is None:
            unknowns += 1
            reasons.append(EligibilityReason(k="unknown", t=_msg("income_unknown", lang)))
        elif value <= int(max_income):
            passes += 1
            reasons.append(EligibilityReason(k="ok", t=_msg("income_ok", lang)))
        else:
            fails += 1
            reasons.append(EligibilityReason(k="no", t=_msg("income_high", lang)))

    work = rules.get("work")
    if work:
        if not profile.work:
            unknowns += 1
        elif profile.work in work:
            passes += 1
            reasons.append(EligibilityReason(k="ok", t=_msg("work_ok", lang)))
        else:
            fails += 1
            reasons.append(EligibilityReason(k="no", t=_msg("work_no", lang)))

    if fails:
        verdict = "no"
    elif unknowns or passes == 0:
        verdict = "maybe"
    else:
        verdict = "likely"

    note = rules.get("note", {})
    return EligibilityResponse(
        verdict=verdict,
        reasons=reasons,
        note=note.get(lang) or note.get("en", "") if isinstance(note, dict) else "",
    )
