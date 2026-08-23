from app.schemas.common import ORMModel


class AIModelRead(ORMModel):
    id: str
    provider: str
    modelKey: str
    displayName: str
    isDefault: bool
    isAvailable: bool
