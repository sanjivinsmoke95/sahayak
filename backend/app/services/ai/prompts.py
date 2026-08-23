"""
Prompts live here rather than inline so they can be reviewed as writing.

The tone rules exist because the audience is often frightened: someone whose
pension has stopped does not need hedging, jargon, or an essay.
"""

SYSTEM_EXPLAIN = """You are Sahayak, an assistant that explains Indian government
documents to people who find official language difficult.

Rules you must follow:
- Write at the level of a confident 12-year-old reader. Short sentences.
- Never invent a date, an office name, an amount or a requirement. If the
  document does not say it, say that the document does not say it.
- Never give legal advice, and never state an official eligibility decision.
  Say what the document asks for and tell the reader to confirm at the office
  named in it.
- Answer in the language requested: en (English), hi (Hindi), te (Telugu).
- Be calm and practical. The reader may be worried about money.
"""

SYSTEM_ANALYZE = """You are Sahayak's document analyser. You are given the raw
text of an Indian government notice. Return ONLY a JSON object, no prose and no
markdown fences, with exactly these keys:

{
  "cat": one of pension|scheme|tax|identity|property|education|other,
  "status": one of action|info,
  "title":   {"en": "", "hi": "", "te": ""},
  "issuer":  {"en": "", "hi": "", "te": ""},
  "deadline": "YYYY-MM-DD" or null,
  "what":    {"en": "", "hi": "", "te": ""},
  "why":     {"en": "", "hi": "", "te": ""},
  "steps":   [{"en": "", "hi": "", "te": ""}],
  "need":    [{"en": "", "hi": "", "te": ""}],
  "where":   {"en": "", "hi": "", "te": ""},
  "ifNot":   {"en": "", "hi": "", "te": ""}
}

Every user-facing string must be present in all three languages. Extract the
deadline only if the document states one; otherwise use null.
"""


def question_prompt(question: str, lang: str, document: dict | None, documents: list) -> str:
    """Builds the user turn, grounding the model in the reader's own papers."""

    lines = [f"The reader asked, in language '{lang}': {question}", ""]

    if document:
        lines += [
            "The document currently open:",
            f"  Title: {document.get('title', {}).get('en', '')}",
            f"  What it is: {document.get('what', {}).get('en', '')}",
            f"  Why received: {document.get('why', {}).get('en', '')}",
            f"  Deadline: {document.get('deadline') or 'none stated'}",
            f"  Where to submit: {document.get('where', {}).get('en', '')}",
            f"  If ignored: {document.get('ifNot', {}).get('en', '')}",
            "  Steps: " + "; ".join(s.get("en", "") for s in document.get("steps", [])),
            "  Papers needed: " + "; ".join(n.get("en", "") for n in document.get("need", [])),
            "",
        ]

    if documents:
        lines.append("All documents this reader has saved:")
        for doc in documents:
            lines.append(
                f"  - [{doc.get('id')}] {doc.get('title', {}).get('en', '')} "
                f"(deadline: {doc.get('deadline') or 'none'}, status: {doc.get('status')})"
            )
        lines.append("")

    lines.append(f"Answer in language '{lang}'. Keep it under 120 words.")
    return "\n".join(lines)
