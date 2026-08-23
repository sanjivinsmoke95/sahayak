"""
myScheme spider.

myScheme (myscheme.gov.in) is a React SPA whose scheme pages live under
/schemes/<slug>. Listing pages are JS-rendered, so we render with Playwright and
then follow scheme detail links. Detail pages carry the structured fields the
generic extractor understands (Eligibility, Documents, Application Process...),
so we reuse the base extraction path.
"""
import scrapy

from crawler.sahayak_crawl.spiders.base_spider import BaseGovSpider
from utils.domain_filter import is_government_url


class MySchemeSpider(BaseGovSpider):
    name = "myscheme"
    max_depth = 1

    def parse_page(self, response):
        # Emit the listing/detail page itself for extraction + generic discovery.
        yield from super().parse_page(response)

        # Explicitly follow scheme-detail links (rendered) which the SPA builds
        # client-side and the generic hint matcher might otherwise miss.
        for href in response.css("a::attr(href)").getall():
            if "/schemes/" not in href:
                continue
            link = response.urljoin(href.strip())
            if is_government_url(link):
                yield scrapy.Request(
                    link,
                    callback=self.parse_page,
                    errback=self.on_error,
                    meta={"depth_custom": self.max_depth, "playwright": True, "render": True},
                    priority=8,
                )
