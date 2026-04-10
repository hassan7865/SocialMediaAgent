from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user
from dependencies.db import get_db
from models.users import User
from services import platforms_service

router = APIRouter(prefix="/api/platforms", tags=["platforms"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_platforms(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Platform connections", await platforms_service.list_platform_connections(db, current_user))


@router.post("/connect/{platform}")
async def connect_platform(
    platform: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        data = await platforms_service.oauth_start(platform, db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return success_response("OAuth started", data)


@router.post("/sync/all")
async def sync_all_platforms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    provider: Annotated[str | None, Query(description="Optional: only sync this platform (e.g. facebook)")] = None,
):
    try:
        data = await platforms_service.sync_all_from_postforme(db, current_user, provider=provider)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return success_response("Platforms synced from Post for Me", data)


@router.post("/sync/{platform}")
async def sync_platform(
    platform: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        data = await platforms_service.sync_from_postforme(platform, db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return success_response("Platform synced", data)


@router.get("/callback/{platform}")
async def platform_callback(platform: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Platform connected", await platforms_service.oauth_callback(platform, db, current_user))


@router.delete("/{connection_id}")
async def delete_platform(connection_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Platform deleted", await platforms_service.delete_connection(connection_id, db, current_user))


@router.post("/{connection_id}/test")
async def test_platform(connection_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Connection tested", await platforms_service.test_connection(connection_id, db, current_user))
