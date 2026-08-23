from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.common import ORMModel


class MessageRead(ORMModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    bullet_list: list[str] | None = None
    document_refs: list[str] | None = None
    created_at: datetime


class ChatRead(ORMModel):
    id: str
    title: str
    language: str
    document_id: str | None = None
    created_at: datetime


class ChatWithMessages(ChatRead):
    messages: list[MessageRead] = []


class ChatCreate(BaseModel):
    documentId: str | None = None
    title: str = ""
