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


class SocialPostMetrics(BaseModel):
    model_config = {"extra": "ignore"}

    views: int | None = None
    impressions: int | None = None
    reach: int | None = None
    likes: int | None = None
    comments: int | None = None
    shares: int | None = None
    saves: int | None = None
    clicks: int | None = None
    engagement_rate: float | None = None


class SocialPostDto(BaseModel):
    model_config = {"extra": "ignore"}

    id: str
    external_id: str | None = None
    caption: str = ""
    status: str
    scheduled_at: str | None = None
    metrics: SocialPostMetrics | None = None


class SocialFeedItem(BaseModel):
    model_config = {"extra": "ignore"}

    id: str
    caption: str | None = None
    platform: str | None = None
    social_account_id: str | None = None
    posted_at: str | None = None
    external_id: str | None = None
    metrics: SocialPostMetrics | None = None


class SocialFeedResponse(BaseModel):
    model_config = {"extra": "ignore"}

    data: list[SocialFeedItem] = Field(default_factory=list)
    meta: PaginatedMeta | None = None
