from datetime import timedelta

from fastapi import HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.security import create_token, hash_password, verify_password
from models.users import User
from schemas.auth import LoginCreate, RegisterCreate, UserResponse

settings = get_settings()


def _should_use_secure_cookies() -> bool:
    return settings.FRONTEND_URL.startswith("https://")


async def register_user(payload: RegisterCreate, db: AsyncSession) -> User:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login_user(payload: LoginCreate, db: AsyncSession, response: Response) -> User:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    issue_auth_cookies(response, str(user.id))
    return user


def issue_auth_cookies(response: Response, user_id: str) -> None:
    access = create_token(user_id, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), "access")
    refresh = create_token(user_id, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS), "refresh")
    secure = _should_use_secure_cookies()
    response.set_cookie("access_token", access, httponly=True, secure=secure, samesite="lax", path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=secure, samesite="lax", path="/")


def clear_auth_cookies(response: Response) -> None:
    secure = _should_use_secure_cookies()
    response.delete_cookie("access_token", path="/", secure=secure, samesite="lax")
    response.delete_cookie("refresh_token", path="/", secure=secure, samesite="lax")


def serialize_user(user: User) -> dict:
    return UserResponse.model_validate(user).model_dump(mode="json")
