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

    # Government interoperability (SIH26129). The connectors reach the mock
    # government systems over HTTP at this base (the app's own /api by default,
    # so a single running backend serves both sides of the demonstration).
    interop_enabled: bool = True
    mock_gov_base_url: str = "http://localhost:8000/api"
    # Optional shared secret the connectors present to the mock systems, to
    # model system-to-system authentication. Blank leaves the mock endpoints
    # open, which is fine for a local demo.
    mock_gov_api_key: str = ""
    # Optional data.gov.in key for reference lookups (pincode -> city/state).
    # Never a dependency: absent, the interop demo works unchanged.
    data_gov_api_key: str = ""

    # Identity encryption (Aadhaar / PAN). Versioned so keys can be rotated:
    # "v1:<base64 32 bytes>,v2:<base64 32 bytes>". Blank leaves the identity
    # endpoints disabled — there is no plaintext fallback. See .env.example.
    identity_encryption_keys: str = ""
    identity_encryption_active_version: str = ""

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

    @property
    def data_gov_enabled(self) -> bool:
        return bool(self.data_gov_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
