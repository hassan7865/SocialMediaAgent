from fastapi import APIRouter, Depends
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
async def connect_platform(platform: str): return success_response("OAuth started", await platforms_service.oauth_start(platform))


@router.get("/callback/{platform}")
async def platform_callback(platform: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Platform connected", await platforms_service.oauth_callback(platform, db, current_user))


@router.delete("/{connection_id}")
async def delete_platform(connection_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Platform deleted", await platforms_service.delete_connection(connection_id, db, current_user))


@router.post("/{connection_id}/test")
async def test_platform(connection_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Connection tested", await platforms_service.test_connection(connection_id, db, current_user))
