"""
Schemas for government services sourced from the Sahayak Data Collector.

These mirror the collector's `ServiceOut` / `SearchResponse` / `PaginatedServices`
/ `StatsResponse` shapes exactly, so the main backend can proxy the collector's
responses through unchanged and the frontend gets one stable, typed contract.
"""

from typing import Any, Literal

from pydantic import BaseModel, Field


class GovServiceForm(BaseModel):
    title: str | None = None
    url: str


class GovServiceFAQ(BaseModel):
    question: str
    answer: str


class GovServiceContact(BaseModel):
    department: str | None = None
    phone: list[str] = Field(default_factory=list)
    email: list[str] = Field(default_factory=list)
    address: str | None = None
    website: str | None = None


class GovService(BaseModel):
    """A single government service / scheme (collector `ServiceOut`)."""

    id: int
    service_name: str
    department: str | None = None
    state: str | None = None
    district: str | None = None
    language: str | None = None
    description: str | None = None
    eligibility: list[str] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)
    application_steps: list[str] = Field(default_factory=list)
    fees: str | None = None
    processing_time: str | None = None
    official_application_url: str | None = None
    official_notification_url: str | None = None
    forms: list[GovServiceForm] = Field(default_factory=list)
    faq: list[GovServiceFAQ] = Field(default_factory=list)
    contact: GovServiceContact = Field(default_factory=GovServiceContact)
    version: int = 1
    last_updated: str | None = None
    source_url: str | None = None


class GovServiceHit(GovService):
    """A search result adds a relevance score (collector `ServiceHit`)."""

    score: float


class PaginatedServices(BaseModel):
    total: int
    limit: int
    offset: int
    results: list[GovService]


class GovServiceSearchResponse(BaseModel):
    query: str
    mode: Literal["keyword", "semantic", "hybrid"]
    count: int
    results: list[GovServiceHit]


class GovServiceVersion(BaseModel):
    version: int
    content_hash: str | None = None
    captured_at: str | None = None
    snapshot: dict[str, Any] = Field(default_factory=dict)


class GovStats(BaseModel):
    total_services: int
    by_state: dict[str, int] = Field(default_factory=dict)
    by_language: dict[str, int] = Field(default_factory=dict)


class GovChatRequest(BaseModel):
    question: str = Field(..., min_length=2)
    lang: str = "en"
    state: str | None = None
    top_k: int = Field(4, ge=1, le=10)


class GovChatCitation(BaseModel):
    service_name: str
    source_url: str | None = None
    official_application_url: str | None = None


class GovChatResponse(BaseModel):
    answer: str
    grounded: bool
    citations: list[GovChatCitation] = Field(default_factory=list)
    used_services: list[GovServiceHit] = Field(default_factory=list)
