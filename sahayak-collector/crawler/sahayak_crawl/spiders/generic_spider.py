"""
Generic government spider.

Driven entirely by a source entry from config/sources.yaml, so most portals need
no code — just a YAML entry. Handles both plain-HTML and Playwright-rendered
pages via the base spider.
"""
from crawler.sahayak_crawl.spiders.base_spider import BaseGovSpider


class GenericGovSpider(BaseGovSpider):
    name = "generic"
    # `custom_source` and `max_depth` are injected by the runner.
