import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BrandVoiceStyle(str, enum.Enum):
    expert = "expert"
    community = "community"
    story = "story"
    data = "data"


class BrandVoice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "brand_voice"

    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, unique=True)
    formality_level: Mapped[int] = mapped_column(Integer, nullable=False)
    style: Mapped[BrandVoiceStyle] = mapped_column(Enum(BrandVoiceStyle, name="brand_voice_style"), nullable=False)
    persona_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    sample_approved_posts: Mapped[list[str] | None] = mapped_column(JSONB)

    company = relationship("Company", lazy="selectin")
