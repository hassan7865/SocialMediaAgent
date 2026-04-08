from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user
from dependencies.db import get_db
from models.users import User
from schemas.brand_voice import BrandVoiceCreate, BrandVoiceUpdate
from services import brand_voice_service

router = APIRouter(prefix="/api/brand-voice", tags=["brand_voice"], dependencies=[Depends(get_current_user)])


@router.get("")
async def get_brand_voice(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Brand voice", await brand_voice_service.get_brand_voice(db, current_user))


@router.post("/analyze")
async def analyze(tone_samples: list[str], background_tasks: BackgroundTasks): return success_response("Analysis complete", await brand_voice_service.analyze_brand_voice(tone_samples, background_tasks))


@router.post("")
async def save(payload: BrandVoiceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Brand voice saved", await brand_voice_service.save_brand_voice(payload, db, current_user))


@router.patch("")
async def update(payload: BrandVoiceUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Brand voice updated", await brand_voice_service.update_brand_voice(payload, db, current_user))


@router.post("/test")
async def test_voice(): return success_response("Brand voice preview", await brand_voice_service.test_brand_voice())
