import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, UUIDPrimaryKeyMixin


class CalendarStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    live = "live"


class ContentCalendar(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "content_calendar"

    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    week_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    status: Mapped[CalendarStatus] = mapped_column(Enum(CalendarStatus, name="calendar_status"), nullable=False)

    company = relationship("Company", lazy="selectin")
