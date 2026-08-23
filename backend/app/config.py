from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Everything configurable, read once from the environment."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    # Application
    app_name: str = "SAHAYAK API"
    environment: str = "development"
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:3000"

    # Database
    database_url: str = "postgresql+asyncpg://sahayak:sahayak@localhost:5432/sahayak"
    db_echo: bool = False

    # Clerk. Blank issuer disables auth so a fresh clone runs.
    clerk_issuer: str = ""
    clerk_secret_key: str = ""
    clerk_audience: str = ""

    # Supabase Storage
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_bucket: str = "sahayak-documents"
    # Development fallback when Supabase is not configured. Relative paths are
    # resolved from the backend directory, never exposed directly to clients.
    local_upload_dir: str = "uploads"

    # AI providers
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    openrouter_api_key: str = ""
    default_ai_provider: str = "rule-based"

    # Government Data Collector (Sahayak crawler) — the standalone service that
    # crawls official government portals and exposes a semantic /search API.
    collector_api_url: str = "http://localhost:8010"
    collector_timeout: float = 10.0

    # Google Maps / Places for the Mee Seva centre finder.
    #  - google_maps_api_key: server-side key used to proxy Places searches. It
    #    is never sent to the browser. Enable the "Places API" for it.
    #  - google_maps_browser_key: an optional, referrer-restricted key sent to
    #    the browser to draw the interactive map. Enable "Maps JavaScript API"
    #    and restrict it to your site. Leave blank to use the list-only view.
    google_maps_api_key: str = ""
    google_maps_browser_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def auth_enabled(self) -> bool:
        return bool(self.clerk_issuer)

    @property
    def storage_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_key)

    @property
    def collector_enabled(self) -> bool:
        return bool(self.collector_api_url)

    @property
    def maps_enabled(self) -> bool:
        return bool(self.google_maps_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
