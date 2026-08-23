from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class Localized(BaseModel):
    """A string in all three supported languages."""

    en: str = ""
    hi: str = ""
    te: str = ""


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Paginated(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int = 1
    page_size: int = Field(default=50, alias="pageSize")
