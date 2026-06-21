"""Application configuration loaded from environment variables or a .env file."""

# Standard library imports
from functools import lru_cache

# 3rd party imports
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All runtime configuration for the application."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str
    database_url_sync: str

    # JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # Web3 / Base chain
    base_rpc_url: str = "https://mainnet.base.org"
    diamond_address: str = "0x4cad6eC90e65baBec9335cAd728DDC610c316368"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Gotify push notifications
    gotify_url: str = ""
    gotify_app_token: str = ""


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
