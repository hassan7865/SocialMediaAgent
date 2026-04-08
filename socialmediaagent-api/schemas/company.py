from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CompanyCreate(BaseModel):
    name: str
    website: str | None = None
    description: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    value_proposition: str | None = None
    differentiators: str | None = None
    key_messages: list[str] | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    website: str | None = None
    description: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    value_proposition: str | None = None
    differentiators: str | None = None
    key_messages: list[str] | None = None


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    website: str | None = None
    description: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    value_proposition: str | None = None
    differentiators: str | None = None
    key_messages: list[str] | None = None
