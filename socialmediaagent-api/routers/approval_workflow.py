from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user, require_admin
from dependencies.db import get_db
from models.users import User
from schemas.approval_workflow import ApprovalWorkflowUpdate
from services import approval_workflow_service

router = APIRouter(tags=["approval_workflow"], dependencies=[Depends(get_current_user)])
workflow_router = APIRouter(prefix="/api/approval-workflow", tags=["approval_workflow"], dependencies=[Depends(get_current_user)])
queue_router = APIRouter(prefix="/api/approval-queue", tags=["approval_workflow"], dependencies=[Depends(get_current_user)])


@workflow_router.get("")
async def get_workflow(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Approval workflow", await approval_workflow_service.get_workflow(db, current_user))


@workflow_router.patch("")
async def update_workflow(payload: ApprovalWorkflowUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    return success_response("Approval workflow updated", await approval_workflow_service.update_workflow(payload, db, current_user))


@queue_router.get("")
async def approval_queue(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Approval queue", await approval_workflow_service.get_approval_queue(db, current_user))
