import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BrandVoiceTone:
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FRIENDLY = "friendly"
    AUTHORITATIVE = "authoritative"
    HUMOROUS = "humorous"
    INSPIRATIONAL = "inspirational"

    ALL = [PROFESSIONAL, CASUAL, FRIENDLY, AUTHORITATIVE, HUMOROUS, INSPIRATIONAL]


class BrandVoice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "brand_voice"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, unique=True
    )
    tone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=BrandVoiceTone.PROFESSIONAL,
    )

    company = relationship("Company", lazy="selectin")
