import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import BackgroundTasks, Request, UploadFile
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.paths import POST_MEDIA_DIR, ensure_upload_dirs
from models.generation_jobs import GenerationJob, JobStatus, JobType
from models.platform_connections import PlatformConnection, PlatformType
from models.post_performance import PostPerformance
from models.posts import ApprovalStatus, CreatedBy, Post, PostStatus
from models.users import User
from services import publish_service
from services.common import paginated_data
from services.common import get_company_for_user, to_dict


def _naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _status_from_schedule(scheduled_at: datetime | None) -> PostStatus:
    """Draft vs scheduled from local time — future slot means scheduled, past/none means draft."""
    if scheduled_at is None:
        return PostStatus.draft
    when = _naive_utc(scheduled_at)
    return PostStatus.scheduled if when > datetime.now(UTC) else PostStatus.draft


def _sync_status_from_schedule(post: Post) -> None:
    """Keep draft/scheduled aligned with scheduled_at. Do not override published/failed."""
    if post.status in (PostStatus.published, PostStatus.failed):
        return
    post.status = _status_from_schedule(post.scheduled_at)


MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024
MAX_POST_VIDEO_BYTES = 80 * 1024 * 1024

_ALLOWED_MEDIA_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-m4v": ".m4v",
    "video/ogg": ".ogv",
}


async def _require_active_platform_connection(db: AsyncSession, company_id, platform: PlatformType) -> None:
    result = await db.execute(
        select(PlatformConnection).where(
            PlatformConnection.company_id == company_id,
            PlatformConnection.platform == platform,
            PlatformConnection.is_active.is_(True),
        )
    )
    if result.scalar_one_or_none() is None:
        raise ValueError(f"Connect {platform.value} under Platforms before creating a post for it.")


async def upload_post_media(file: UploadFile, request: Request, db: AsyncSession, user: User) -> dict[str, Any]:
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    ensure_upload_dirs()
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in _ALLOWED_MEDIA_TYPES:
        raise ValueError(
            "Unsupported file type. Use an image (JPEG, PNG, WebP, GIF) or a short video (MP4, WebM, MOV, OGV)."
        )
    raw = await file.read()
    max_bytes = MAX_POST_VIDEO_BYTES if content_type.startswith("video/") else MAX_POST_IMAGE_BYTES
    if len(raw) > max_bytes:
        kind = "video" if content_type.startswith("video/") else "image"
        limit_mb = max_bytes // (1024 * 1024)
        raise ValueError(f"{kind.capitalize()} must be {limit_mb}MB or smaller.")
    ext = _ALLOWED_MEDIA_TYPES[content_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    rel_path = f"post_media/{filename}"
    dest = POST_MEDIA_DIR / filename
    dest.write_bytes(raw)
    settings = get_settings()
    base = (settings.API_PUBLIC_BASE_URL or "").strip().rstrip("/")
    if not base:
        base = str(request.base_url).rstrip("/")
    url = f"{base}/api/uploads/{rel_path}"
    return {"url": url}


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
            "external_publish_id",
            "publish_last_error",
            "publish_attempted_at",
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
    if payload.company_id != company.id:
        raise ValueError("company_id must match your organization")
    try:
        platform_enum = PlatformType(payload.platform.lower())
    except ValueError as e:
        raise ValueError("Invalid platform") from e
    await _require_active_platform_connection(db, company.id, platform_enum)
    post = Post(
        company_id=company.id,
        platform=platform_enum,
        content_text=payload.content_text,
        media_urls=payload.media_urls,
        scheduled_at=payload.scheduled_at,
        status=_status_from_schedule(payload.scheduled_at),
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
    if post.status not in (PostStatus.published, PostStatus.failed):
        _sync_status_from_schedule(post)
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
        await publish_service.try_publish_post_by_id(db, post_id, force_immediate=False)
        await db.refresh(post)
        # If Post for Me is not configured, reflect schedule locally so UI is not stuck on "draft" alone.
        settings = get_settings()
        if not settings.POSTFORME_API_KEY.strip() and post.approval_status == ApprovalStatus.approved:
            post = await db.get(Post, post_id)
            if post and not post.external_publish_id and post.status not in (PostStatus.failed, PostStatus.published):
                _sync_status_from_schedule(post)
                await db.commit()
                await db.refresh(post)
        return _post_payload(post)
    raise LookupError("Post not found")


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
    raise LookupError("Post not found")


async def publish_now(post_id: str, db: AsyncSession, user: User):
    from core.config import get_settings

    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if not post or not company or post.company_id != company.id:
        raise LookupError("Post not found")
    if post.approval_status != ApprovalStatus.approved:
        raise ValueError("Post must be approved before publishing")
    if not get_settings().POSTFORME_API_KEY.strip():
        raise ValueError("Post for Me is not configured (set POSTFORME_API_KEY)")
    if post.external_publish_id:
        raise ValueError("Post was already submitted to Post for Me")
    await publish_service.try_publish_post(db, post, force_immediate=True)
    await db.refresh(post)
    return _post_payload(post)


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
