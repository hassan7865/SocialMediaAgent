from datetime import timedelta

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.responses import success_response
from core.security import decode_token
from dependencies.auth import get_current_user
from dependencies.db import get_db
from models.users import User
from schemas.auth import LoginCreate, RegisterCreate
from services.auth_service import clear_auth_cookies, issue_auth_cookies, login_user, register_user, user_me_payload

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/register")
async def register(payload: RegisterCreate, db: AsyncSession = Depends(get_db)):
    user = await register_user(payload, db)
    return success_response("Registered", await user_me_payload(user, db))


@router.post("/login")
async def login(payload: LoginCreate, response: Response, db: AsyncSession = Depends(get_db)):
    user = await login_user(payload, db, response)
    return success_response("Logged in", await user_me_payload(user, db))


@router.post("/logout")
async def logout(response: Response): clear_auth_cookies(response); return success_response("Logged out", None)


@router.post("/refresh")
async def refresh(response: Response, refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    try:
        payload = decode_token(refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    issue_auth_cookies(response, payload["sub"])
    return success_response("Refreshed", None)


@router.get("/me")
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return success_response("Current user", await user_me_payload(current_user, db))
