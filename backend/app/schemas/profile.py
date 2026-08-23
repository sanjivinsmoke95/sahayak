from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    relationship: str = Field(default="other", max_length=48)


class ProfileRead(BaseModel):
    id: str
    name: str
    relationship: str
    isSelf: bool


class DocumentProfileUpdate(BaseModel):
    profileId: str
