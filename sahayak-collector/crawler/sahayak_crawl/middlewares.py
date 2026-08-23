"""
Downloader middleware that GUARANTEES the crawler only ever touches official
government domains.

Even if a spider accidentally yields an off-domain request, this middleware
raises IgnoreRequest and it never leaves the machine. It also records a stat so
the crawl summary can report how many off-domain links were blocked.
"""
from __future__ import annotations

from scrapy import signals
from scrapy.exceptions import IgnoreRequest

from utils.domain_filter import is_government_url
from utils.logging_config import get_logger

log = get_logger("middleware.domain")


class GovernmentDomainMiddleware:
    """Reject any request whose URL is not an official government domain."""

    def __init__(self, stats=None):
        self.stats = stats

    @classmethod
    def from_crawler(cls, crawler):
        mw = cls(stats=crawler.stats)
        crawler.signals.connect(mw.spider_opened, signal=signals.spider_opened)
        return mw

    def process_request(self, request, spider):
        if not is_government_url(request.url):
            if self.stats:
                self.stats.inc_value("sahayak/non_gov_blocked")
            log.warning("blocked_non_gov_url", url=request.url)
            raise IgnoreRequest(f"Non-government URL blocked: {request.url}")
        return None  # allow

    def spider_opened(self, spider):
        log.info("spider_opened", spider=spider.name)
