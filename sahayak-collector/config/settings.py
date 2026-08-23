"""
Central configuration.

All runtime configuration is read from environment variables (loaded from a
`.env` file in development). Using pydantic-settings gives us typed, validated
settings with sane defaults and a single import point for the whole project.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Strongly-typed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # ---- PostgreSQL ----
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "sahayak"
    postgres_user: str = "sahayak"
    postgres_password: str = "change_me"

    # ---- Crawler behaviour ----
    crawl_concurrency: int = 8
    concurrent_per_domain: int = 2
    download_delay: float = 1.0
    crawl_max_depth: int = 2               # how many hops from a homepage
    autothrottle_enabled: bool = True

    # Only crawl sources that permit it. Add a source only after reviewing its
    # terms and robots.txt.
    respect_robots_txt: bool = True

    user_agent: str = (
        "SahayakBot/1.0 (+https://example.org/sahayak; contact=admin@example.org)"
    )

    # ---- Playwright (JS rendering) ----
    playwright_enabled: bool = True        # global kill-switch for JS rendering
    playwright_timeout_ms: int = 30000

    # ---- Embeddings / semantic search ----
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 384

    # ---- Search ----
    default_search_mode: str = "hybrid"    # keyword | semantic | hybrid
    hybrid_semantic_weight: float = 0.6    # 0..1; keyword weight = 1 - this

    # ---- API ----
    api_host: str = "0.0.0.0"
    api_port: int = 8010                   # collector runs beside the app API
    log_level: str = "INFO"

    # ---- Scheduler ----
    refresh_cron: str = Field(default="0 3 * * *")

    @property
    def sqlalchemy_url(self) -> str:
        """Synchronous SQLAlchemy connection URL."""
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


settings = get_settings()
