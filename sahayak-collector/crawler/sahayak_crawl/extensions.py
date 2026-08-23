"""
CrawlStatsLogger — a Scrapy extension that emits a single structured summary at
the start and end of every crawl.

It reads from Scrapy's built-in stats collector, which our pipelines and
middleware increment with `sahayak/*` counters, so the summary covers exactly
what the reviewer asked for: pages, services, failures, skipped, robots blocks
and duplicates.
"""
from __future__ import annotations

from datetime import datetime, timezone

from scrapy import signals

from utils.logging_config import get_logger

log = get_logger("crawl")


class CrawlStatsLogger:
    """Logs start/finish plus a counters breakdown for each spider run."""

    def __init__(self):
        self._started_at: datetime | None = None

    @classmethod
    def from_crawler(cls, crawler):
        ext = cls()
        crawler.signals.connect(ext.on_opened, signal=signals.spider_opened)
        crawler.signals.connect(ext.on_closed, signal=signals.spider_closed)
        return ext

    def on_opened(self, spider):
        self._started_at = datetime.now(timezone.utc)
        src = getattr(spider, "custom_source", {}) or {}
        log.info(
            "crawl_start",
            spider=spider.name,
            source=src.get("name"),
            start_urls=src.get("start_urls", []),
            max_depth=getattr(spider, "max_depth", None),
        )

    def on_closed(self, spider, reason):
        stats = spider.crawler.stats
        duration = None
        if self._started_at:
            duration = round(
                (datetime.now(timezone.utc) - self._started_at).total_seconds(), 1
            )
        log.info(
            "crawl_finish",
            spider=spider.name,
            reason=reason,
            duration_s=duration,
            pages_crawled=stats.get_value("response_received_count", 0),
            services_inserted=stats.get_value("sahayak/services_inserted", 0),
            services_updated=stats.get_value("sahayak/services_updated", 0),
            duplicates_unchanged=stats.get_value("sahayak/services_unchanged", 0),
            pages_skipped_no_service=stats.get_value("sahayak/skipped_no_service", 0),
            non_gov_blocked=stats.get_value("sahayak/non_gov_blocked", 0),
            robots_blocked=stats.get_value("robotstxt/forbidden", 0),
            request_failures=stats.get_value("sahayak/request_failures", 0),
            extraction_errors=stats.get_value("sahayak/extraction_errors", 0),
            db_errors=stats.get_value("sahayak/db_errors", 0),
        )
