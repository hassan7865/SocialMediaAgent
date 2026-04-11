from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator

MAX_MEDIA_PER_POST = 10


class PostCreate(BaseModel):
    company_id: UUID
    platform: str
    content_text: str
    scheduled_at: datetime | None = None
    media_urls: list[str] | None = None

    @field_validator("media_urls")
    @classmethod
    def validate_media_count(cls, v: list[str] | None) -> list[str] | None:
        if v is not None and len(v) > MAX_MEDIA_PER_POST:
            raise ValueError(f"At most {MAX_MEDIA_PER_POST} media files per post")
        return v


class PostUpdate(BaseModel):
    content_text: str | None = None
    scheduled_at: datetime | None = None
    media_urls: list[str] | None = None

    @field_validator("media_urls")
    @classmethod
    def validate_media_count(cls, v: list[str] | None) -> list[str] | None:
        if v is not None and len(v) > MAX_MEDIA_PER_POST:
            raise ValueError(f"At most {MAX_MEDIA_PER_POST} media files per post")
        return v


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    company_id: UUID
    platform: str
    content_text: str
    status: str
