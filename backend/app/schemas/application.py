from pydantic import BaseModel

from app.schemas.intelligence import ReadinessRead


class ApplicationCreate(BaseModel):
    serviceId: str


class ApplicationStatusUpdate(BaseModel):
    status: str
    note: str | None = None


class ApplicationEventRead(BaseModel):
    oldStatus: str | None = None
    newStatus: str
    source: str
    note: str | None = None
    at: str


class ApplicationRead(BaseModel):
    id: str
    serviceId: str
    status: str
    notes: str | None = None
    submittedAt: str | None = None
    createdAt: str
    updatedAt: str


class ApplicationDetailRead(ApplicationRead):
    readiness: ReadinessRead | None = None
    timeline: list[ApplicationEventRead] = []
