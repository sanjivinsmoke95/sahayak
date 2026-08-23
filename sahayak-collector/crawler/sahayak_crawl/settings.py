"""
Scrapy settings for the Sahayak crawler (Scrapy 2.13+).

Design goals: resilient (never stops on a bad page), polite (throttled, honest
UA), fast (JS rendering only when a source needs it, media blocked), and
observable (a stats extension logs a structured summary of every crawl).

Notes on 2.13 modernisation:
  * REQUEST_FINGERPRINTER_IMPLEMENTATION was removed — the old "2.6" value is
    gone and setting it now only emits deprecation noise, so it is deleted.
  * The asyncio reactor is the default in 2.13; we still name it explicitly
    because scrapy-playwright requires it and being explicit aids onboarding.
"""
from config.settings import settings as app_settings

BOT_NAME = "sahayak_crawl"
SPIDER_MODULES = ["crawler.sahayak_crawl.spiders"]
NEWSPIDER_MODULE = "crawler.sahayak_crawl.spiders"

# ---- Identity & politeness ----
USER_AGENT = app_settings.user_agent
ROBOTSTXT_OBEY = app_settings.respect_robots_txt
CONCURRENT_REQUESTS = app_settings.crawl_concurrency
CONCURRENT_REQUESTS_PER_DOMAIN = app_settings.concurrent_per_domain
DOWNLOAD_DELAY = app_settings.download_delay
COOKIES_ENABLED = False

# ---- AutoThrottle: adapt to server load, avoid rate-limit bans ----
AUTOTHROTTLE_ENABLED = app_settings.autothrottle_enabled
AUTOTHROTTLE_START_DELAY = 1.0
AUTOTHROTTLE_MAX_DELAY = 30.0
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.5

# ---- Depth (configurable crawl depth) ----
DEPTH_LIMIT = app_settings.crawl_max_depth
DEPTH_PRIORITY = 1                 # breadth-first: shallow pages first
SCHEDULER_DISK_QUEUE = "scrapy.squeues.PickleFifoDiskQueue"
SCHEDULER_MEMORY_QUEUE = "scrapy.squeues.FifoMemoryQueue"

# ---- Retries & timeouts (error handling) ----
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [429, 500, 502, 503, 504, 522, 524, 408]
RETRY_PRIORITY_ADJUST = -1
DOWNLOAD_TIMEOUT = 30

# 404 and other client errors: keep them OFF the allowed list so the spider's
# errback records them and moves on (the crawl never stops on a broken URL).
HTTPERROR_ALLOWED_CODES = []

# ---- HTTP cache: speeds up re-runs during a demo, cuts load on gov sites ----
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 3600          # 1 hour
HTTPCACHE_DIR = ".scrapy/httpcache"
HTTPCACHE_IGNORE_HTTP_CODES = [429, 500, 502, 503, 504]
HTTPCACHE_STORAGE = "scrapy.extensions.httpcache.FilesystemCacheStorage"

# ---- Middlewares ----
DOWNLOADER_MIDDLEWARES = {
    "crawler.sahayak_crawl.middlewares.GovernmentDomainMiddleware": 100,
}

# ---- Extensions: structured crawl-stats summary on close ----
EXTENSIONS = {
    "crawler.sahayak_crawl.extensions.CrawlStatsLogger": 500,
}

# ---- Item pipeline: parse -> extract -> embed -> upsert to Postgres ----
ITEM_PIPELINES = {
    "crawler.sahayak_crawl.pipelines.ExtractionPipeline": 300,
    "crawler.sahayak_crawl.pipelines.PostgresPipeline": 800,
}

# ---- Playwright (JS rendering) — only used when a source sets render: true ----
if app_settings.playwright_enabled:
    DOWNLOAD_HANDLERS = {
        "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
        "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    }
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_LAUNCH_OPTIONS = {"headless": True}
PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT = app_settings.playwright_timeout_ms
PLAYWRIGHT_MAX_PAGES_PER_CONTEXT = 4      # cap memory from parallel tabs

# Block heavy resources (images/media/fonts/stylesheets) during rendering — we
# only need the DOM text, so this cuts bandwidth and memory dramatically.
def _abort_heavy_resources(request):
    return request.resource_type in ("image", "media", "font", "stylesheet")

PLAYWRIGHT_ABORT_REQUEST = _abort_heavy_resources

# ---- Logging ----
LOG_LEVEL = app_settings.log_level
LOG_FORMAT = "%(asctime)s [%(name)s] %(levelname)s: %(message)s"
