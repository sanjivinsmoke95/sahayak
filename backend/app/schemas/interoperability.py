"""Wire shapes for the interoperability layer (SIH26129).

camelCase on the wire to match the rest of the API. The canonical address shape
{line1, city, state, pincode} is the one representation used end to end — the
citizen's profile, the request body, the connectors and every mock system all
speak it, so nothing in the core has to know five departmental formats.
"""

from typing import Any, Literal

from pydantic import BaseModel, Field

GovSystem = Literal["aadhaar", "pan", "rto", "passport", "voter"]
SyncField = Literal["address", "phone"]
SystemStatus = Literal["success", "failed", "pending"]
BatchStatus = Literal["pending", "success", "partial", "failed", "denied"]


class AddressValue(BaseModel):
    line1: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""


class CitizenProfileRead(BaseModel):
    fullName: str = ""
    dob: str = ""
    address: AddressValue = Field(default_factory=AddressValue)
    phone: str = ""


class CitizenProfileUpdate(BaseModel):
    """Edits to the display-only identity fields (never propagated)."""

    fullName: str | None = Field(default=None, max_length=120)
    dob: str | None = Field(default=None, max_length=10)


class AddressUpdateRequest(BaseModel):
    value: AddressValue
    targets: list[GovSystem] = Field(default_factory=list)
    consent: bool = False
    purpose: str = Field(default="cross_system_update", max_length=120)


class PhoneUpdateRequest(BaseModel):
    value: str = Field(..., min_length=6, max_length=20)
    targets: list[GovSystem] = Field(default_factory=list)
    consent: bool = False
    purpose: str = Field(default="cross_system_update", max_length=120)


class SystemResult(BaseModel):
    system: GovSystem
    label: str
    status: SystemStatus
    error: str | None = None
    attempts: int = 0


class SyncResponse(BaseModel):
    batchId: str
    field: SyncField
    # True only when every targeted system succeeded.
    success: bool
    status: BatchStatus
    results: list[SystemResult]


class SyncBatchRead(BaseModel):
    batchId: str
    field: SyncField
    status: BatchStatus
    oldValue: Any | None = None
    newValue: Any | None = None
    consented: bool
    results: list[SystemResult]
    at: str


class MockCitizenRead(BaseModel):
    system: GovSystem
    label: str
    address: AddressValue = Field(default_factory=AddressValue)
    phone: str = ""
    isOnline: bool = True


class SystemHealthToggle(BaseModel):
    """Demo lever: take a mock system offline so a sync partially fails."""

    online: bool


class PincodeReference(BaseModel):
    """Optional reference lookup (data.gov.in). Absent key -> available=False."""

    available: bool = False
    pincode: str = ""
    city: str | None = None
    state: str | None = None
