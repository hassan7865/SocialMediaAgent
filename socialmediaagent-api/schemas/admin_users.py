from pydantic import BaseModel


class ReviewerPermissionUpdate(BaseModel):
    can_review: bool


class CompanyMemberCreate(BaseModel):
    identifier: str
    full_name: str | None = None
