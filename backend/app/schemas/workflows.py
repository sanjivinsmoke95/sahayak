from pydantic import BaseModel


class RejectionAppeal(BaseModel):
    phones: list[str] = []
    emails: list[str] = []
    urls: list[str] = []


class RejectionRead(BaseModel):
    isRejection: bool
    reasonStated: bool
    reason: str | None = None
    relatedDocuments: list[str] = []
    suggestedActions: list[str] = []
    appeal: RejectionAppeal
    confidence: float


class VerificationSignal(BaseModel):
    type: str
    detected: bool
    value: str | None = None


class VerificationRead(BaseModel):
    signals: list[VerificationSignal] = []


class FormField(BaseModel):
    key: str
    sensitive: bool = False
    suggestedValue: str | None = None
    source: str | None = None
    confidence: float


class FormRead(BaseModel):
    isForm: bool
    fields: list[FormField] = []
