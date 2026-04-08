from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PostCreate(BaseModel):
    company_id: UUID
    platform: str
    content_text: str
    scheduled_at: datetime | None = None


class PostUpdate(BaseModel):
    content_text: str | None = None
    scheduled_at: datetime | None = None


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    company_id: UUID
    platform: str
    content_text: str
    status: str
