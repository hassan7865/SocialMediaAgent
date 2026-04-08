from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PlatformConnectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    platform: str
    account_name: str | None = None
    is_active: bool
    connected_at: datetime
