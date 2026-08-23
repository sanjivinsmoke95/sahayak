"""
Base spider shared by all source spiders (Scrapy 2.13+).

Responsibilities:
  * seed the crawl from official homepages via the modern async `start()` API
  * enforce the government-domain rule before yielding any request
  * SMART LINK DISCOVERY: follow only links that look like service/scheme pages
    (keyword allow-list) and skip noise (news, tenders, careers, media, ...),
    giving high-signal links a higher scheduling priority
  * emit a PageItem for the extraction pipeline
  * survive every failure — a broken URL is logged and skipped, never fatal
"""
from __future__ import annotations

import re

import scrapy

from crawler.sahayak_crawl.items import PageItem
from utils.domain_filter import is_government_url, registrable_domain

# Links whose URL contains any of these are likely real service/scheme pages.
SERVICE_HINTS = (
    "certificate", "income", "birth", "death", "caste", "ration", "pension",
    "license", "licence", "scholarship", "scheme", "service", "citizen",
    "registration", "apply", "application", "document", "eligibility",
    "passport", "aadhaar", "kisan", "ayushman", "welfare", "benefit",
)

# Links whose URL contains any of these are noise — never follow them.
IGNORE_HINTS = (
    "news", "press", "career", "job", "tender", "media", "gallery", "video",
    "photo", "image", "/img/", "recruit", "vacancy", "advertisement", "rti-",
    "sitemap", "feedback", "login", "logout", "facebook", "twitter", "youtube",
    "instagram", "linkedin", "whatsapp", "mailto:", "tel:", "javascript:",
    ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".zip", ".css", ".js",
)

# PDFs are ignored UNLESS they look like an application/registration form.
_FORM_PDF = re.compile(r"(form|application|apply|register)", re.IGNORECASE)


class BaseGovSpider(scrapy.Spider):
    """Common crawl behaviour; concrete spiders set name / start config."""

    # Injected by the runner from sources.yaml.
    custom_source: dict = {}
    max_depth: int = 2

    # ---- Scrapy 2.13 async seeding (replaces deprecated start_requests) ----
    async def start(self):
        src = self.custom_source
        render = bool(src.get("render", False))
        for url in src.get("start_urls", []):
            if not is_government_url(url):
                self.logger.warning("skip non-gov start url: %s", url)
                continue
            yield self._make_request(url, render=render, depth=0, priority=10)

    def _make_request(self, url, render, depth, priority=0):
        meta = {"depth_custom": depth, "render": render}
        if render:
            meta["playwright"] = True
        return scrapy.Request(
            url,
            callback=self.parse_page,
            errback=self.on_error,
            meta=meta,
            priority=priority,
            dont_filter=False,
        )

    # ---- Link classification ---------------------------------------------
    @staticmethod
    def _should_follow(link: str) -> bool:
        low = link.lower()
        if any(bad in low for bad in IGNORE_HINTS):
            # A PDF is allowed only if it is clearly an application form.
            if low.endswith(".pdf") and _FORM_PDF.search(low):
                return True
            return False
        return any(h in low for h in SERVICE_HINTS)

    # ---- Parsing ---------------------------------------------------------
    def parse_page(self, response):
        # Non-HTML (e.g. a PDF we followed) has no .text worth extracting.
        ctype = response.headers.get("Content-Type", b"").decode("latin-1").lower()
        if "html" not in ctype and "<html" not in response.text[:200].lower():
            return

        src = self.custom_source
        depth = response.meta.get("depth_custom", 0)

        # 1) Emit the current page for extraction.
        yield PageItem(
            url=response.url,
            html=response.text,
            source_name=src.get("name"),
            default_department=src.get("default_department"),
            default_state=src.get("default_state"),
            default_language=src.get("default_language", "en"),
        )

        # 2) Discover deeper service links (bounded depth, same registrable domain).
        if depth >= self.max_depth:
            return
        allowed = {registrable_domain(u) for u in src.get("start_urls", [])}
        seen = set()
        for href in response.css("a::attr(href)").getall():
            link = response.urljoin(href.strip())
            if link in seen:
                continue
            seen.add(link)
            if not is_government_url(link):
                continue
            if registrable_domain(link) not in allowed:
                continue
            if not self._should_follow(link):
                continue
            yield self._make_request(
                link, render=src.get("render", False), depth=depth + 1, priority=5
            )

    # ---- Error handling: log, count, continue ----------------------------
    def on_error(self, failure):
        request = failure.request
        if self.crawler and self.crawler.stats:
            self.crawler.stats.inc_value("sahayak/request_failures")
        self.logger.warning(
            "request_failed url=%s error=%s", request.url, repr(failure.value)
        )
