from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CalendarGenerateCreate(BaseModel):
    week_start: date
    goals: list[str] | None = None
    platforms: list[str] | None = None


class CalendarUpdate(BaseModel):
    status: str | None = None


class CalendarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    week_start_date: date
    status: str
