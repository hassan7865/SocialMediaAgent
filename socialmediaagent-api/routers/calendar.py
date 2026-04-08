from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user, require_reviewer_or_admin
from dependencies.db import get_db
from models.users import User
from schemas.calendar import CalendarGenerateCreate, CalendarUpdate
from services import calendar_service

router = APIRouter(prefix="/api/calendar", tags=["calendar"], dependencies=[Depends(get_current_user)])


@router.get("")
async def get_calendar(week: date | None = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Calendar fetched", await calendar_service.get_calendar(db, current_user, week=week))


@router.post("/generate")
async def generate_calendar(payload: CalendarGenerateCreate, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Calendar generation started", await calendar_service.generate_calendar(payload, background_tasks, db, current_user))


@router.post("/approve-all")
async def approve_all(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_reviewer_or_admin)):
    return success_response("Calendar approvals processed", await calendar_service.approve_all(db, current_user))


@router.patch("/{calendar_id}")
async def update_calendar(calendar_id: str, payload: CalendarUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Calendar updated", await calendar_service.update_calendar(calendar_id, payload, db, current_user))
