from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_postforme_base(url: str) -> str:
    u = (url or "").strip().rstrip("/")
    for suf in ("/v1",):
        if u.endswith(suf):
            u = u[: -len(suf)].rstrip("/")
            break
    return u or "https://api.postforme.dev"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    SECRET_KEY: str
    FRONTEND_URL: str
    # Public API base (no trailing slash) for absolute media URLs when publishing; if empty, derived from the upload request.
    API_PUBLIC_BASE_URL: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    POSTFORME_API_BASE: str = "https://api.postforme.dev"
    POSTFORME_API_KEY: str = ""
    POSTFORME_WEBHOOK_SECRET: str = ""

    @field_validator("POSTFORME_API_BASE", mode="after")
    @classmethod
    def normalize_postforme_base(cls, v: str) -> str:
        return _normalize_postforme_base(v)


@lru_cache
def get_settings() -> Settings:
    return Settings()
