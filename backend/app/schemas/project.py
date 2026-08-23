from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class ProjectRead(ORMModel):
    id: str
    name: str
    description: str | None = None
    created_at: datetime


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
