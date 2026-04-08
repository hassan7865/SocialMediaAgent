from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class RegisterCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class LoginCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    full_name: str | None = None
    role: str
    can_review: bool
