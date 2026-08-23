"""
Orchestrator: raw HTML -> rich, validated extraction.

Pipeline:
  HtmlParser -> ParsedPage
     -> classify every section label (headings/accordions/cards/dl) into buckets
     -> field extractors + validators + cleaning
     -> ExtractionResult (all target fields + quality score)
     -> ServiceRecord (unchanged DB/API contract)

Backward compatible: `extract(html, url) -> ServiceRecord | None` behaves exactly
as before (same fields, same content hash). `extract_rich(html, url)` returns the
full ExtractionResult. Generic across sites — no per-website selectors.
"""
from __future__ import annotations

from typing import Optional

from extractor import quality, validators
from extractor.field_extractors import (
    build_tags,
    detect_language,
    extract_emails,
    extract_keywords,
    extract_phones,
    faq_from_sections,
    parse_age_requirement,
    parse_category_requirement,
    parse_income_requirement,
    scalar_from_kv,
)
from extractor.result import ExtractionResult
from extractor.text_cleaning import clean_list, dedupe_paragraphs, first_sentence, split_sentences
from models.schema import ContactInfo, FAQItem, FormItem, ServiceRecord
from parser.html_parser import HtmlParser, ParsedPage
from parser.section_detector import classify_heading, clean_step
from utils.hashing import content_hash

# Schema.org types we recognise for a government service in JSON-LD.
_JSONLD_SERVICE_TYPES = {"governmentservice", "service", "govtservice", "webpage", "article"}


class ServiceExtractor:
    """Convert one government service page into a rich, validated result."""

    def __init__(
        self,
        source_name: Optional[str] = None,
        default_department: Optional[str] = None,
        default_state: Optional[str] = None,
        default_language: str = "en",
    ):
        self.source_name = source_name
        self.default_department = default_department
        self.default_state = default_state
        self.default_language = default_language

    # ---- Public API -----------------------------------------------------
    def extract(self, html: str, url: str) -> Optional[ServiceRecord]:
        """Backward-compatible entry point used by the crawler pipeline."""
        rich = self.extract_rich(html, url)
        return rich.to_service_record() if rich else None

    def extract_rich(self, html: str, url: str) -> Optional[ExtractionResult]:
        """Full extraction with every field + quality score."""
        page = HtmlParser(html, url).parse()
        jsonld = self._jsonld_service(page)

        service_name = self._service_name(page, jsonld)
        if not service_name:
            return None

        b = self._bucket_sections(page)

        # ---- lists (cleaned + de-duplicated; prose falls back to sentences) ----
        eligibility = self._list_field(b, "eligibility")
        documents = self._list_field(b, "required_documents")
        certificates = self._list_field(b, "required_certificates")
        steps = [clean_step(s) for s in self._list_field(b, "application_steps")]
        online = [clean_step(s) for s in self._list_field(b, "online_process")]
        offline = [clean_step(s) for s in self._list_field(b, "offline_process")]
        benefits = self._list_field(b, "benefits")
        special = self._list_field(b, "special_conditions")

        # ---- descriptions ----
        long_desc = self._description(page, b, jsonld)
        short_desc = (
            page.meta.get("description")
            or (first_sentence(long_desc) if long_desc else None)
        )

        # ---- scalars from key/value + section text ----
        fees = scalar_from_kv(page.kv_pairs, "fees") or b.get("fees_text")
        processing_time = scalar_from_kv(page.kv_pairs, "processing_time") or b.get("processing_time_text")
        validity = scalar_from_kv(page.kv_pairs, "validity") or b.get("validity_text")
        renewal = scalar_from_kv(page.kv_pairs, "renewal_information") or b.get("renewal_information_text")
        department = scalar_from_kv(page.kv_pairs, "department") or self._from_breadcrumbs(page) or self.default_department
        ministry = scalar_from_kv(page.kv_pairs, "ministry")
        authority = scalar_from_kv(page.kv_pairs, "authority")
        state = scalar_from_kv(page.kv_pairs, "state") or self.default_state
        district = scalar_from_kv(page.kv_pairs, "district")
        language = detect_language(page.raw_text, default=self.default_language)

        # ---- requirements (from eligibility text) ----
        elig_blob = " ".join(eligibility) + " " + b.get("eligibility_text", "")
        age_req = parse_age_requirement(elig_blob) or scalar_from_kv(page.kv_pairs, "age_requirements")
        income_req = parse_income_requirement(elig_blob)
        category_req = parse_category_requirement(elig_blob)

        # ---- links & forms ----
        forms = [FormItem(**f) for f in page.form_links]
        application_url = self._application_url(page, url)
        notification_url = self._notification_url(page)

        # ---- FAQ ----
        faq_raw = self._faq(page, b, jsonld)
        faq = [FAQItem(**f) for f in faq_raw]

        # ---- contact ----
        contact = self._contact(page, b, department)

        # ---- important dates ----
        dates_blob = " ".join([b.get("important_dates_text", "")] + b.get("important_dates_items", []))
        important_dates = validators.find_dates(dates_blob)

        # ---- keywords & tags ----
        keywords = extract_keywords(service_name, long_desc or "", " ".join(eligibility), limit=12)
        tags = build_tags(service_name, state, department)

        result = ExtractionResult(
            service_name=service_name,
            short_description=short_desc,
            long_description=long_desc,
            department=department,
            ministry=ministry,
            authority=authority,
            state=state,
            district=district,
            language=language,
            eligibility=eligibility,
            required_documents=documents,
            required_certificates=certificates,
            application_steps=steps,
            offline_process=offline,
            online_process=online,
            benefits=benefits,
            special_conditions=special,
            important_dates=important_dates,
            fees=fees,
            fees_normalized=validators.normalise_fee(fees or ""),
            processing_time=processing_time,
            validity=validity,
            renewal_information=renewal,
            age_requirements=age_req,
            income_requirements=income_req,
            category_requirements=category_req,
            official_application_url=application_url,
            official_notification_url=notification_url,
            forms=forms,
            faq=faq,
            contact=contact,
            keywords=keywords,
            tags=tags,
            source_url=url,
            source_name=self.source_name,
        )
        # Content hash over substantive fields (same inputs as before for stability).
        result.content_hash = content_hash(
            service_name, long_desc or "", " ".join(eligibility), " ".join(documents),
            " ".join(steps), fees or "", processing_time or "",
        )
        result.quality_score, result.quality_metrics = quality.score(result)
        return result

    # ---- internals ------------------------------------------------------
    def _jsonld_service(self, page: ParsedPage) -> dict:
        for block in page.jsonld:
            if not isinstance(block, dict):
                continue
            t = block.get("@type", "")
            types = [t] if isinstance(t, str) else (t or [])
            if any(str(x).lower() in _JSONLD_SERVICE_TYPES for x in types):
                return block
        return {}

    def _service_name(self, page: ParsedPage, jsonld: dict) -> Optional[str]:
        for sec in page.sections:
            if sec.level == 1 and sec.heading:
                return sec.heading
        if jsonld.get("name"):
            return str(jsonld["name"]).strip()
        return page.title or page.meta.get("og_title") or None

    def _bucket_sections(self, page: ParsedPage) -> dict:
        b: dict = {}
        for sec in page.sections:
            field = classify_heading(sec.heading)
            if not field:
                continue
            if sec.list_items:
                b.setdefault(f"{field}_items", []).extend(sec.list_items)
            if sec.text:
                prev = b.get(f"{field}_text", "")
                b[f"{field}_text"] = f"{prev} {sec.text}".strip()
        return b

    @staticmethod
    def _list_field(b: dict, field: str) -> list[str]:
        """List items for a field; if it came as prose, split into sentences.
        Handles the 'lists converted to paragraphs' case generically."""
        items = clean_list(b.get(f"{field}_items", []))
        if items:
            return items
        text = b.get(f"{field}_text", "")
        return clean_list(split_sentences(text)) if text else []

    def _description(self, page: ParsedPage, b: dict, jsonld: dict) -> Optional[str]:
        candidate = (
            b.get("description_text")
            or (jsonld.get("description") if jsonld else None)
            or page.meta.get("description")
            or (page.main_text.split("\n")[0] if page.main_text else None)
        )
        return dedupe_paragraphs(candidate) if candidate else None

    def _from_breadcrumbs(self, page: ParsedPage) -> Optional[str]:
        # A middle breadcrumb often names the department/category.
        crumbs = [c for c in page.breadcrumbs if c.lower() not in ("home", "services")]
        return crumbs[-2] if len(crumbs) >= 2 else None

    def _application_url(self, page: ParsedPage, url: str) -> Optional[str]:
        for link in page.apply_links:
            if validators.valid_gov_url(link):
                return link
        for link in page.internal_links:
            low = link.lower()
            if any(k in low for k in ("apply", "registration", "onlineservice", "login")):
                return link
        return url

    def _notification_url(self, page: ParsedPage) -> Optional[str]:
        for form in page.form_links + page.download_links:
            t = (form.get("title") or "").lower() + " " + form.get("url", "").lower()
            if any(k in t for k in ("notification", "gazette", "circular", "order", "guideline")):
                return form["url"]
        return None

    def _faq(self, page: ParsedPage, b: dict, jsonld: dict) -> list[dict]:
        # Prefer schema.org FAQPage if present.
        for block in page.jsonld:
            if isinstance(block, dict) and str(block.get("@type", "")).lower() == "faqpage":
                out = []
                for q in block.get("mainEntity", []) or []:
                    ans = (q.get("acceptedAnswer") or {}).get("text")
                    if q.get("name") and ans:
                        out.append({"question": q["name"], "answer": ans})
                if out:
                    return out
        return faq_from_sections(b.get("faq_text", ""), b.get("faq_items", []))

    def _contact(self, page: ParsedPage, b: dict, department) -> ContactInfo:
        blob = " ".join(filter(None, [b.get("contact_text", ""), page.main_text[:2500]]))
        source = b.get("contact_text", "") or blob
        return ContactInfo(
            department=department,
            phone=extract_phones(source),
            email=extract_emails(source),
            website=page.url,
        )
