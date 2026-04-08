from fastapi import BackgroundTasks
from sqlalchemy import extract, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from models.platform_connections import PlatformType
from models.post_performance import PostPerformance
from models.posts import Post
from models.users import User
from services.common import get_company_for_user


async def summary(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return {
            "total_posts": 0,
            "avg_engagement": 0,
            "top_platform": None,
            "this_month_count": 0,
            "previous_month_count": 0,
            "monthly_change_pct": 0,
            "weekly_reach": 0,
        }
    total_posts_q = await db.execute(select(func.count()).select_from(Post).where(Post.company_id == company.id))
    total_posts = int(total_posts_q.scalar_one() or 0)
    avg_eng_q = await db.execute(
        select(func.avg(PostPerformance.engagement_rate))
        .select_from(PostPerformance)
        .join(Post, Post.id == PostPerformance.post_id)
        .where(Post.company_id == company.id)
    )
    avg_engagement = float(avg_eng_q.scalar_one() or 0)
    top_platform_q = await db.execute(
        select(Post.platform, func.count(Post.id).label("count"))
        .where(Post.company_id == company.id)
        .group_by(Post.platform)
        .order_by(func.count(Post.id).desc())
        .limit(1)
    )
    top_platform_row = top_platform_q.first()
    month_q = await db.execute(
        select(func.count())
        .select_from(Post)
        .where(Post.company_id == company.id, extract("month", Post.created_at) == extract("month", func.now()))
    )
    previous_month_q = await db.execute(
        select(func.count())
        .select_from(Post)
        .where(
            Post.company_id == company.id,
            extract("month", Post.created_at) == extract("month", func.now() - text("interval '1 month'")),
            extract("year", Post.created_at) == extract("year", func.now() - text("interval '1 month'")),
        )
    )
    weekly_reach_q = await db.execute(
        select(func.coalesce(func.sum(PostPerformance.reach), 0))
        .select_from(PostPerformance)
        .join(Post, Post.id == PostPerformance.post_id)
        .where(Post.company_id == company.id, Post.created_at >= func.now() - text("interval '7 days'"))
    )
    this_month_count = int(month_q.scalar_one() or 0)
    previous_month_count = int(previous_month_q.scalar_one() or 0)
    monthly_change_pct = (
        round(((this_month_count - previous_month_count) / previous_month_count) * 100, 2)
        if previous_month_count > 0
        else (100.0 if this_month_count > 0 else 0.0)
    )
    return {
        "total_posts": total_posts,
        "avg_engagement": round(avg_engagement, 2),
        "top_platform": top_platform_row[0].value if top_platform_row else None,
        "this_month_count": this_month_count,
        "previous_month_count": previous_month_count,
        "monthly_change_pct": monthly_change_pct,
        "weekly_reach": int(weekly_reach_q.scalar_one() or 0),
    }


async def engagement(days: int, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return {"series": []}
    rows = await db.execute(
        select(
            func.date_trunc("week", Post.created_at).label("bucket"),
            Post.platform,
            func.avg(PostPerformance.engagement_rate).label("engagement"),
        )
        .join(PostPerformance, PostPerformance.post_id == Post.id, isouter=True)
        .where(Post.company_id == company.id)
        .group_by("bucket", Post.platform)
        .order_by("bucket")
        .limit(max(1, days // 7))
    )
    series = [
        {"bucket": row.bucket.isoformat() if row.bucket else None, "platform": row.platform.value, "value": float(row.engagement or 0)}
        for row in rows
    ]
    return {"series": series}


async def top_posts(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return []
    rows = await db.execute(
        select(Post, PostPerformance.engagement_rate)
        .join(PostPerformance, PostPerformance.post_id == Post.id, isouter=True)
        .where(Post.company_id == company.id)
        .order_by(PostPerformance.engagement_rate.desc().nullslast())
        .limit(10)
    )
    return [
        {
            "id": str(post.id),
            "title": post.content_text[:80],
            "platform": post.platform.value,
            "engagement_rate": float(engagement or 0),
            "created_at": post.created_at,
        }
        for post, engagement in rows
    ]


async def posting_heatmap(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return {"matrix": []}
    rows = await db.execute(
        select(
            extract("dow", Post.created_at).label("dow"),
            extract("hour", Post.created_at).label("hour"),
            func.count(Post.id).label("count"),
        )
        .where(Post.company_id == company.id)
        .group_by("dow", "hour")
    )
    matrix = [{"dow": int(row.dow), "hour": int(row.hour), "count": int(row.count)} for row in rows]
    return {"matrix": matrix}


async def platform_breakdown(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return []
    rows = await db.execute(
        select(Post.platform, func.count(Post.id).label("count"))
        .where(Post.company_id == company.id)
        .group_by(Post.platform)
    )
    total = sum(int(row.count) for row in rows) or 1
    rows = await db.execute(
        select(Post.platform, func.count(Post.id).label("count"))
        .where(Post.company_id == company.id)
        .group_by(Post.platform)
    )
    return [
        {"platform": row.platform.value if isinstance(row.platform, PlatformType) else str(row.platform), "count": int(row.count), "share": round(int(row.count) * 100 / total, 2)}
        for row in rows
    ]


async def sync_analytics(background_tasks: BackgroundTasks, *_args, **_kwargs):
    background_tasks.add_task(lambda: None)
    return {"queued": True}
