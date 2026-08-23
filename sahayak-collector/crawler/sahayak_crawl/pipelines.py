"""
Item pipelines.

ExtractionPipeline : PageItem(html) -> ServiceRecord (+embedding)
PostgresPipeline   : ServiceRecord -> versioned upsert into PostgreSQL.

Both stages are defensive: a failure on one page is logged, counted in Scrapy
stats (so the crawl summary is accurate) and dropped — never crashing the crawl.
"""
from __future__ import annotations

from itemadapter import ItemAdapter
from scrapy.exceptions import DropItem

from database.connection import init_db, session_scope
from database.repository import UpsertResult, upsert_service
from extractor.service_extractor import ServiceExtractor
from search.embeddings import embed, service_text
from utils.logging_config import get_logger

log = get_logger("pipeline")


def _bump(spider, key: str) -> None:
    if spider.crawler and spider.crawler.stats:
        spider.crawler.stats.inc_value(key)


class ExtractionPipeline:
    """Convert raw HTML to a validated ServiceRecord and attach an embedding."""

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        url = adapter.get("url")
        try:
            extractor = ServiceExtractor(
                source_name=adapter.get("source_name"),
                default_department=adapter.get("default_department"),
                default_state=adapter.get("default_state"),
                default_language=adapter.get("default_language", "en"),
            )
            record = extractor.extract(adapter.get("html", ""), url)
        except Exception as exc:  # noqa: BLE001 - never crash the crawl
            _bump(spider, "sahayak/extraction_errors")
            log.error("extraction_failed", url=url, error=str(exc))
            raise DropItem(f"extraction error: {url}") from exc

        if record is None:
            _bump(spider, "sahayak/skipped_no_service")
            raise DropItem(f"no service found on page: {url}")

        # Attach embedding for semantic search; failure is non-fatal.
        try:
            record_embedding = embed(service_text(record))
        except Exception as exc:  # noqa: BLE001
            log.warning("embedding_failed", url=url, error=str(exc))
            record_embedding = None

        return {"record": record, "embedding": record_embedding}


class PostgresPipeline:
    """Versioned upsert of extracted records into PostgreSQL."""

    def open_spider(self, spider):
        # Ensure schema + pgvector exist before the first write.
        init_db()

    def process_item(self, item, spider):
        record = item["record"]
        embedding = item.get("embedding")
        try:
            with session_scope() as session:
                result = upsert_service(session, record, embedding)
            _bump(spider, f"sahayak/services_{result.action}")  # inserted/updated/unchanged
            log.info(
                "upsert",
                action=result.action,
                version=result.version,
                service=record.service_name,
                url=record.source_url,
            )
        except Exception as exc:  # noqa: BLE001
            _bump(spider, "sahayak/db_errors")
            log.error("db_write_failed", url=record.source_url, error=str(exc))
            raise DropItem(f"db error: {record.source_url}") from exc
        return item
