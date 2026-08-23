from app.schemas.common import ORMModel


class UserRead(ORMModel):
    id: str
    clerk_id: str
    email: str | None = None
    display_name: str = ""
