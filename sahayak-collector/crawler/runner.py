"""
Programmatic crawl runner.

Loads config/sources.yaml and launches the appropriate spider for one source, a
list of sources, or all of them. Used by the CLI (`python -m crawler.runner`)
and by the scheduler for periodic refreshes.
"""
from __future__ import annotations

import argparse

import yaml
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

from config.settings import PROJECT_ROOT, settings
from crawler.sahayak_crawl.spiders.generic_spider import GenericGovSpider
from crawler.sahayak_crawl.spiders.myscheme_spider import MySchemeSpider

_SPIDER_REGISTRY = {
    "generic": GenericGovSpider,
    "myscheme": MySchemeSpider,
}


def load_sources() -> list[dict]:
    with open(PROJECT_ROOT / "config" / "sources.yaml", encoding="utf-8") as fh:
        return yaml.safe_load(fh).get("sources", [])


def run(source_names: list[str] | None = None) -> None:
    """Crawl the named sources (or all sources if None)."""
    sources = load_sources()
    if source_names:
        wanted = set(source_names)
        sources = [s for s in sources if s["name"] in wanted]

    process = CrawlerProcess(get_project_settings())
    for src in sources:
        spider_cls = _SPIDER_REGISTRY.get(src.get("spider", "generic"))
        if spider_cls is None:
            continue
        # Per-source depth override, else the spider's own default (which itself
        # falls back to the global crawl_max_depth via the DEPTH_LIMIT setting).
        max_depth = int(src.get("max_depth", spider_cls.max_depth or settings.crawl_max_depth))
        process.crawl(spider_cls, custom_source=src, max_depth=max_depth)
    process.start()  # blocks until all crawls complete


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Sahayak gov crawler.")
    parser.add_argument("sources", nargs="*", help="Source names to crawl (default: all).")
    args = parser.parse_args()
    run(args.sources or None)


if __name__ == "__main__":
    main()
