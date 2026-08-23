"""
Canonical output schema for a government service.

This is the single source of truth for the JSON shape every crawled page is
converted into. Using Pydantic gives us validation, `null` handling and clean
serialisation to the exact schema requested by the application.

Rule: NEVER fabricate data. If a field is not present on the official page it
stays `None` (serialised as JSON `null`) or an empty list/dict.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


class FAQItem(BaseModel):
    question: str
    answer: str


class FormItem(BaseModel):
    title: Optional[str] = None
    url: str


class ContactInfo(BaseModel):
    """Free-form but structured contact block. All fields optional."""

    department: Optional[str] = None
    phone: list[str] = Field(default_factory=list)
    email: list[str] = Field(default_factory=list)
    address: Optional[str] = None
    website: Optional[str] = None


class ServiceRecord(BaseModel):
    """
    The exact schema the Sahayak application consumes.

    Serialise with `.model_dump(mode="json")` to obtain the requested JSON.
    """

    service_name: str
    department: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    language: Optional[str] = "en"
    description: Optional[str] = None
    eligibility: list[str] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)
    application_steps: list[str] = Field(default_factory=list)
    fees: Optional[str] = None
    processing_time: Optional[str] = None
    official_application_url: Optional[str] = None
    official_notification_url: Optional[str] = None
    forms: list[FormItem] = Field(default_factory=list)
    faq: list[FAQItem] = Field(default_factory=list)
    contact: ContactInfo = Field(default_factory=ContactInfo)

    # ---- Provenance / bookkeeping (not part of the app-facing schema, but
    #      useful for dedup and change-detection). Excluded on request. ----
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    content_hash: Optional[str] = None
    last_updated: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    @field_validator("service_name")
    @classmethod
    def _name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("service_name must not be empty")
        return v.strip()

    def app_payload(self) -> dict:
        """Return ONLY the application-facing fields, in requested order."""
        data = self.model_dump(mode="json")
        for meta in ("source_url", "source_name", "content_hash", "last_updated"):
            data.pop(meta, None)
        return data
