from fastapi import BackgroundTasks
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.generation_jobs import GenerationJob, JobStatus, JobType
from models.post_performance import PostPerformance
from models.posts import ApprovalStatus, CreatedBy, Post, PostStatus
from models.users import User
from services.common import paginated_data
from services.common import get_company_for_user, to_dict


def _post_payload(post: Post):
    return to_dict(
        post,
        [
            "id",
            "company_id",
            "platform",
            "content_text",
            "hashtags",
            "media_urls",
            "scheduled_at",
            "published_at",
            "status",
            "approval_status",
            "approved_by",
            "rejection_reason",
            "created_by",
            "created_at",
            "updated_at",
        ],
    )


async def list_posts(pagination, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return paginated_data([], total=0, page=pagination.page, limit=pagination.limit)
    count_q = await db.execute(select(func.count()).select_from(Post).where(Post.company_id == company.id))
    total = int(count_q.scalar_one() or 0)
    offset = (pagination.page - 1) * pagination.limit
    result = await db.execute(
        select(Post).where(Post.company_id == company.id).order_by(Post.created_at.desc()).offset(offset).limit(pagination.limit)
    )
    return paginated_data([_post_payload(p) for p in result.scalars().all()], total=total, page=pagination.page, limit=pagination.limit)


async def get_post(post_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if post and company and post.company_id == company.id:
        return _post_payload(post)
    return {"id": post_id}


async def create_post(payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    post = Post(
        company_id=payload.company_id if getattr(payload, "company_id", None) else company.id,
        platform=payload.platform,
        content_text=payload.content_text,
        scheduled_at=payload.scheduled_at,
        status=PostStatus.scheduled if payload.scheduled_at else PostStatus.draft,
        approval_status=ApprovalStatus.pending,
        created_by=CreatedBy.human,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return _post_payload(post)


async def update_post(post_id: str, payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if not post or not company or post.company_id != company.id:
        return {"id": post_id}
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(post, key, value)
    await db.commit()
    await db.refresh(post)
    return _post_payload(post)


async def delete_post(post_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if post and company and post.company_id == company.id:
        await db.delete(post)
        await db.commit()
    return {"deleted_id": post_id}


async def approve_post(post_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if post and company and post.company_id == company.id:
        post.approval_status = ApprovalStatus.approved
        post.approved_by = user.id
        post.rejection_reason = None
        await db.commit()
        await db.refresh(post)
        return _post_payload(post)
    return {"id": post_id, "approval_status": "approved"}


async def reject_post(post_id: str, reason: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if post and company and post.company_id == company.id:
        post.approval_status = ApprovalStatus.rejected
        post.approved_by = user.id
        post.rejection_reason = reason
        await db.commit()
        await db.refresh(post)
        return _post_payload(post)
    return {"id": post_id, "approval_status": "rejected", "reason": reason}


async def publish_now(post_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if post and company and post.company_id == company.id:
        post.status = PostStatus.published
        await db.commit()
        await db.refresh(post)
        return _post_payload(post)
    return {"id": post_id, "status": "published"}


async def generate_post(payload, background_tasks: BackgroundTasks, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return {"queued": False, "config": payload}
    job = GenerationJob(
        company_id=company.id,
        job_type=JobType.single_post,
        status=JobStatus.queued,
        config=payload,
    )
    db.add(job)
    background_tasks.add_task(lambda: None)
    await db.commit()
    await db.refresh(job)
    return {"queued": True, "config": payload, "job_id": str(job.id)}


async def get_post_performance(post_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return {"id": post_id, "engagement_rate": 0}
    result = await db.execute(
        select(PostPerformance).join(Post, and_(Post.id == PostPerformance.post_id)).where(
            Post.id == post_id, Post.company_id == company.id
        )
    )
    performance = result.scalar_one_or_none()
    if performance:
        return to_dict(performance, ["id", "post_id", "platform", "likes", "comments", "shares", "clicks", "impressions", "reach", "engagement_rate", "fetched_at"])
    return {"id": post_id, "engagement_rate": 0}
