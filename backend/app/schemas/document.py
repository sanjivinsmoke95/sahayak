from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.common import Localized

Category = Literal["pension", "scheme", "tax", "identity", "property", "education", "other"]
Status = Literal["action", "done", "info"]


class EligibilityRules(BaseModel):
    minAge: int | None = None
    maxAge: int | None = None
    maxIncome: int | None = None
    work: list[str] | None = None
    note: Localized


class GovernmentWording(BaseModel):
    """The official phrasing, in the language it was printed in."""

    what: str = ""
    why: str = ""
    doIt: str = ""
    where: str = ""


class JargonPair(BaseModel):
    """One line of officialese beside what it actually means."""

    gov: str
    simple: Localized


class PersonalField(BaseModel):
    """A structured detail read from the document; sensitive ones are masked in the UI."""

    label: Localized
    value: str
    sensitive: bool = False


class DocumentRead(BaseModel):
    """
    Matches the SahayakDocument interface on the frontend exactly, including
    the short field names, so no mapping layer is needed in the browser.
    """

    id: str
    cat: Category
    status: Status
    seeded: bool = False
    title: Localized
    issuer: Localized
    refNo: str = ""
    received: str
    deadline: str | None = None
    what: Localized
    why: Localized
    steps: list[Localized]
    need: list[Localized]
    needDone: list[bool] = []
    where: Localized
    ifNot: Localized
    explain: Localized
    gov: GovernmentWording
    original: str = ""
    pairs: list[JargonPair] = []
    elig: EligibilityRules | None = None
    personal: list[PersonalField] = []
    docType: str = ""
    isGovernment: bool = True
    confidence: float = 1.0
    profileId: str | None = None


class AnalyzeRequest(BaseModel):
    """Either a bundled sample, or a file already uploaded to storage."""

    sampleId: str | None = None
    fileId: str | None = None
    fileName: str | None = None


class ChecklistToggle(BaseModel):
    documentId: str
    kind: Literal["steps", "need"]
    index: int = Field(ge=0)
    done: bool


class ReminderToggle(BaseModel):
    documentId: str
    enabled: bool


ChecklistMap = dict[str, dict[str, dict[str, bool]]]


class DocumentCreate(BaseModel):
    slug: str
    category: Category = "other"
    status: Status = "action"
    title: Localized
    received_on: date | None = None
    deadline_on: date | None = None
    payload: dict[str, Any] = {}
