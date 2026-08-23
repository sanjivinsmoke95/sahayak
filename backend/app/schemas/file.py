from datetime import datetime

from pydantic import BaseModel


class FileRead(BaseModel):
    id: str
    documentId: str | None = None
    name: str
    mimeType: str
    sizeBytes: int
    originalSizeBytes: int | None = None
    storagePath: str
    url: str | None = None
    createdAt: datetime
