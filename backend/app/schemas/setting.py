from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SettingsRead(BaseModel):
    """camelCase on the wire, snake_case in the database."""

    model_config = ConfigDict(populate_by_name=True)

    language: Literal["en", "hi", "te"] = "en"
    textSize: Literal["standard", "large", "xlarge"] = Field(default="standard")
    readAloud: bool = False
    autoShrink: bool = True
    displayName: str = ""


class SettingsUpdate(BaseModel):
    language: Literal["en", "hi", "te"] | None = None
    textSize: Literal["standard", "large", "xlarge"] | None = None
    readAloud: bool | None = None
    autoShrink: bool | None = None
    displayName: str | None = None
