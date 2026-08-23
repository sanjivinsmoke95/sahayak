from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Language = Literal["en", "hi", "te"]


class AskRequest(BaseModel):
    question: str
    lang: Language = "en"
    documentId: str | None = None
    modelId: str | None = None


class AskResponse(BaseModel):
    """
    The field is called `bullets` in Python and `list` on the wire.

    Naming it `list` outright shadows the builtin inside the class body, which
    breaks every annotation declared after it. FastAPI serialises by alias, so
    the frontend still receives `list` exactly as before.
    """

    model_config = ConfigDict(populate_by_name=True)

    text: str
    bullets: list[str] | None = Field(default=None, alias="list")
    docRefs: list[str] | None = None
    setLang: Language | None = None


class EligibilityProfile(BaseModel):
    age: str = ""
    state: str = ""
    income: str = ""
    work: str = ""


class EligibilityRequest(BaseModel):
    documentId: str
    lang: Language = "en"
    profile: EligibilityProfile


class EligibilityReason(BaseModel):
    k: Literal["ok", "no", "unknown"]
    t: str


class EligibilityResponse(BaseModel):
    verdict: Literal["likely", "maybe", "no"]
    reasons: list[EligibilityReason]
    note: str
