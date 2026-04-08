from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user
from dependencies.db import get_db
from dependencies.pagination import PaginationParams, get_pagination_params
from models.users import User
from services import jobs_service

router = APIRouter(prefix="/api/jobs", tags=["jobs"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_jobs(
    pagination: PaginationParams = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return success_response("Jobs fetched", await jobs_service.list_jobs(pagination, db, current_user))


@router.get("/{job_id}")
async def get_job(job_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Job fetched", await jobs_service.get_job(job_id, db, current_user))


@router.post("/{job_id}/cancel")
async def cancel_job(job_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Job cancelled", await jobs_service.cancel_job(job_id, db, current_user))
