"""
ExtractionResult — the rich, validated output object.

Carries EVERY extraction target when present, plus a quality score. It is
additive: `to_service_record()` maps back to the existing `ServiceRecord` so the
crawler pipeline and database are completely unchanged. New consumers can use the
full result (e.g. `.model_dump()` for the schema in the task's OUTPUT example).
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from models.schema import ContactInfo, FAQItem, FormItem, ServiceRecord


class ExtractionResult(BaseModel):
    # Core identity
    service_name: str
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    department: Optional[str] = None
    ministry: Optional[str] = None
    authority: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    language: str = "en"

    # Structured lists
    eligibility: list[str] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)
    required_certificates: list[str] = Field(default_factory=list)
    application_steps: list[str] = Field(default_factory=list)
    offline_process: list[str] = Field(default_factory=list)
    online_process: list[str] = Field(default_factory=list)
    benefits: list[str] = Field(default_factory=list)
    special_conditions: list[str] = Field(default_factory=list)
    important_dates: list[str] = Field(default_factory=list)

    # Scalars
    fees: Optional[str] = None
    fees_normalized: Optional[str] = None
    processing_time: Optional[str] = None
    validity: Optional[str] = None
    renewal_information: Optional[str] = None
    age_requirements: Optional[str] = None
    income_requirements: Optional[str] = None
    category_requirements: Optional[str] = None

    # Links & docs
    official_application_url: Optional[str] = None
    official_notification_url: Optional[str] = None
    forms: list[FormItem] = Field(default_factory=list)

    # Contact & Q/A
    faq: list[FAQItem] = Field(default_factory=list)
    contact: ContactInfo = Field(default_factory=ContactInfo)

    # Discovery
    keywords: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)

    # Provenance & quality
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    content_hash: Optional[str] = None
    quality_score: float = 0.0
    quality_metrics: dict = Field(default_factory=dict)

    def to_service_record(self) -> ServiceRecord:
        """Map back to the existing ServiceRecord (unchanged DB/API contract)."""
        rec = ServiceRecord(
            service_name=self.service_name,
            department=self.department,
            state=self.state,
            district=self.district,
            language=self.language,
            description=self.long_description or self.short_description,
            eligibility=self.eligibility,
            required_documents=self.required_documents,
            application_steps=self.application_steps,
            fees=self.fees,
            processing_time=self.processing_time,
            official_application_url=self.official_application_url,
            official_notification_url=self.official_notification_url,
            forms=self.forms,
            faq=self.faq,
            contact=self.contact,
            source_url=self.source_url,
            source_name=self.source_name,
        )
        rec.content_hash = self.content_hash
        return rec
