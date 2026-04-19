from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user
from dependencies.db import get_db
from models.users import User
from services import analytics_service

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/summary")
async def summary(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return success_response(
        "Analytics summary", await analytics_service.summary(db, current_user)
    )


@router.get("/engagement")
async def engagement(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return success_response(
        "Analytics engagement",
        await analytics_service.engagement(days=days, db=db, user=current_user),
    )


@router.get("/top-posts")
async def top_posts(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return success_response(
        "Top posts", await analytics_service.top_posts(db, current_user)
    )


@router.get("/posting-heatmap")
async def posting_heatmap(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return success_response(
        "Posting heatmap", await analytics_service.posting_heatmap(db, current_user)
    )


@router.get("/platform-breakdown")
async def platform_breakdown(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return success_response(
        "Platform breakdown",
        await analytics_service.platform_breakdown(db, current_user),
    )


@router.post("/sync")
async def sync(background_tasks: BackgroundTasks):
    return success_response(
        "Analytics sync queued",
        await analytics_service.sync_analytics(background_tasks),
    )


@router.post("/sync-metrics")
async def sync_metrics(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return success_response(
        "Post metrics synced from Post for Me",
        await analytics_service.sync_all_post_metrics(db, current_user),
    )
