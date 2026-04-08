from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.db import get_db
from services.health_service import health_status

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(db: AsyncSession = Depends(get_db)): return success_response("Service health", await health_status(db))
