"""Pydantic response models for the collector API (drives OpenAPI docs)."""
from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ServiceOut(BaseModel):
    id: int
    service_name: str
    department: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None
    eligibility: list[str] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)
    application_steps: list[str] = Field(default_factory=list)
    fees: Optional[str] = None
    processing_time: Optional[str] = None
    official_application_url: Optional[str] = None
    official_notification_url: Optional[str] = None
    forms: list[dict] = Field(default_factory=list)
    faq: list[dict] = Field(default_factory=list)
    contact: dict = Field(default_factory=dict)
    version: int = 1
    last_updated: Optional[str] = None
    source_url: Optional[str] = None


class ServiceHit(ServiceOut):
    score: float


class SearchResponse(BaseModel):
    query: str
    mode: Literal["keyword", "semantic", "hybrid"]
    count: int
    results: list[ServiceHit]


class PaginatedServices(BaseModel):
    total: int
    limit: int
    offset: int
    results: list[ServiceOut]


class VersionOut(BaseModel):
    version: int
    content_hash: Optional[str] = None
    captured_at: Optional[str] = None
    snapshot: dict[str, Any]


class StatsResponse(BaseModel):
    total_services: int
    by_state: dict[str, int]
    by_language: dict[str, int]


class CrawlAccepted(BaseModel):
    status: str
    sources: Any
