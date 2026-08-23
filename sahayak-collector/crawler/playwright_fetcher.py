"""
Standalone Playwright fetcher.

Scrapy renders JS pages via scrapy-playwright inside the crawl. This module is a
lightweight, independent helper for one-off fetches (debugging, the scheduler's
targeted refresh of a single JS page, or unit tests) without spinning up Scrapy.
"""
from __future__ import annotations

from utils.domain_filter import is_government_url


async def fetch_rendered_html(
    url: str, wait_selector: str | None = None, timeout_ms: int = 30000
) -> str:
    """
    Return fully-rendered HTML for a JavaScript-heavy government page.

    Raises ValueError for non-government URLs (defence in depth).
    """
    if not is_government_url(url):
        raise ValueError(f"Refusing to fetch non-government URL: {url}")

    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=timeout_ms)
            if wait_selector:
                await page.wait_for_selector(wait_selector, timeout=timeout_ms)
            return await page.content()
        finally:
            await browser.close()
