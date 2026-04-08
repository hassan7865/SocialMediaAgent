import enum
import uuid

from sqlalchemy import Enum, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ApprovalMode(str, enum.Enum):
    full_review = "full_review"
    spot_check = "spot_check"
    autonomous = "autonomous"


class ApprovalWorkflow(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "approval_workflows"

    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, unique=True)
    mode: Mapped[ApprovalMode] = mapped_column(Enum(ApprovalMode, name="approval_mode"), nullable=False)
    reviewer_user_ids: Mapped[list[str] | None] = mapped_column(JSONB)

    company = relationship("Company", lazy="selectin")
