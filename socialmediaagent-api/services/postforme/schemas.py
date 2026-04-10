"""Subset of Post for Me OpenAPI models used by our integration."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SocialAccountProviderAuthUrlDto(BaseModel):
    url: str
    platform: str


class SocialAccountDto(BaseModel):
    model_config = {"extra": "ignore"}

    id: str
    platform: str
    username: str | None = None
    user_id: str | None = None
    status: str | None = None


class PaginatedMeta(BaseModel):
    model_config = {"extra": "ignore"}

    total: float | int = 0
    offset: float | int = 0
    limit: float | int = 0
    next: str | None = None


class SocialAccountsListResponse(BaseModel):
    model_config = {"extra": "ignore"}

    data: list[SocialAccountDto] = Field(default_factory=list)
    meta: PaginatedMeta | None = None


class SocialPostMediaItem(BaseModel):
    url: str


class CreateSocialPostBody(BaseModel):
    caption: str
    social_accounts: list[str]
    scheduled_at: str | None = None
    media: list[SocialPostMediaItem] | None = None
    external_id: str | None = None
    isDraft: bool | None = False


class SocialPostDto(BaseModel):
    model_config = {"extra": "ignore"}

    id: str
    external_id: str | None = None
    caption: str = ""
    status: str
    scheduled_at: str | None = None
