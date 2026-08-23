"""
Background refresh scheduler (APScheduler).

Periodically re-crawls every configured source so the knowledge base stays in
sync with the official websites. Because the repository layer detects content
changes via `content_hash`, unchanged pages are cheap no-ops and only genuinely
updated services bump `last_updated`.

Run with:  python -m scheduler.jobs
"""
from __future__ import annotations

import subprocess
import sys

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from config.settings import PROJECT_ROOT, settings
from crawler.runner import load_sources
from utils.logging_config import configure_logging, get_logger

configure_logging()
log = get_logger("scheduler")


def refresh_all_sources() -> None:
    """
    Launch a fresh crawl of all sources in a SEPARATE process.

    Scrapy's Twisted reactor cannot be restarted within one process, so each
    scheduled run shells out to `python -m crawler.runner`. This keeps the
    scheduler long-lived while each crawl gets a clean reactor.
    """
    names = [s["name"] for s in load_sources()]
    log.info("refresh_start", sources=names)
    try:
        subprocess.run(
            [sys.executable, "-m", "crawler.runner"],
            cwd=str(PROJECT_ROOT),
            check=True,
        )
        log.info("refresh_complete")
    except subprocess.CalledProcessError as exc:
        log.error("refresh_failed", returncode=exc.returncode)


def build_scheduler() -> BlockingScheduler:
    scheduler = BlockingScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(
        refresh_all_sources,
        trigger=CronTrigger.from_crontab(settings.refresh_cron),
        id="refresh_all_sources",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=3600,
    )
    return scheduler


def main() -> None:
    scheduler = build_scheduler()
    log.info("scheduler_starting", cron=settings.refresh_cron)
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log.info("scheduler_stopped")


if __name__ == "__main__":
    main()
