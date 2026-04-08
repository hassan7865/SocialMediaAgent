from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user
from dependencies.db import get_db
from models.users import User
from schemas.company import CompanyCreate, CompanyUpdate
from services import company_service

router = APIRouter(prefix="/api/company", tags=["company"], dependencies=[Depends(get_current_user)])


@router.get("")
async def get_company(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Company profile", await company_service.get_company_profile(db, current_user))


@router.post("")
async def create_company(payload: CompanyCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Company created", await company_service.create_company_profile(payload, db, current_user))


@router.patch("")
async def update_company(payload: CompanyUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Company updated", await company_service.update_company_profile(payload, db, current_user))


@router.post("/scrape")
async def scrape_company(url: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Scrape started", await company_service.scrape_company_website(url, background_tasks, db, current_user))


@router.post("/ingest-document")
async def ingest_document(file: UploadFile, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Document queued", await company_service.ingest_document(file, db, current_user))
