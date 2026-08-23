from typing import Literal

from pydantic import BaseModel

ValidityStatus = Literal["valid", "expiring", "expired", "unknown"]
RequirementStatus = Literal["satisfied", "missing", "expired", "unknown"]
ReadinessStatus = Literal["ready", "almost_ready", "needs_confirmation", "not_ready"]
UsableResult = Literal["likely_acceptable", "needs_confirmation", "expired", "does_not_satisfy"]


class ValidityRead(BaseModel):
    issueDate: str | None = None
    expiryDate: str | None = None
    status: ValidityStatus
    daysLeft: int | None = None
    source: str
    confidence: float


class ConsistencyIssue(BaseModel):
    type: str
    severity: Literal["info", "warning", "high"]
    documents: list[str]
    documentTitles: list[str]
    values: list[str]
    field: str


class ConsistencyRead(BaseModel):
    issues: list[ConsistencyIssue] = []


class RequirementReadiness(BaseModel):
    index: int
    label: str
    status: RequirementStatus
    matchedDocumentId: str | None = None
    matchedDocType: str | None = None
    reason: str
    confidence: float


class ReadinessRead(BaseModel):
    serviceId: str
    status: ReadinessStatus
    score: int
    satisfied: int
    total: int
    requirements: list[RequirementReadiness]


class UsableForRead(BaseModel):
    serviceId: str
    requirement: str | None = None
    result: UsableResult
    reason: str


class DiscoveryService(BaseModel):
    serviceId: str
    status: Literal["ready", "likely_relevant"]
    score: int
    satisfied: int
    total: int
    missingCount: int


class DiscoveryRead(BaseModel):
    services: list[DiscoveryService] = []
