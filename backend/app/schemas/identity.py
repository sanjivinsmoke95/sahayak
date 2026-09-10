"""Wire shapes for identity numbers.

Note what is absent: no response model here carries the number itself except
`IdentityRevealResponse`, which is returned only by the dedicated reveal
endpoint. The default read model cannot express a plaintext value at all, so a
future change to the router cannot leak one through it by accident.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

IdentityKind = Literal["aadhaar", "pan"]


class IdentityRead(BaseModel):
    """What every listing and write returns: the masked form, never the value."""

    kind: IdentityKind
    masked: str
    updatedAt: datetime | None = None


class IdentityUpsert(BaseModel):
    # Bounded well above any real identifier but far below anything that could
    # be used to smuggle a document through this field.
    value: str = Field(..., min_length=8, max_length=32)


class IdentityRevealResponse(BaseModel):
    """The single shape permitted to carry plaintext, from one endpoint."""

    kind: IdentityKind
    value: str


class IdentityAuditEntry(BaseModel):
    kind: IdentityKind
    action: str
    success: bool
    at: datetime
