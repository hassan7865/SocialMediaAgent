"""Send posts to Post for Me. Status updates are handled via webhooks and background publish checks."""

from __future__ import annotations

import logging
import re
from datetime import UTC, datetime, timedelta
from html import unescape

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from models.platform_connections import PlatformConnection, PlatformType
from models.posts import Post, PostStatus
from services.common import get_company_for_user
from services.postforme.client import PostForMeClient, PostForMeClientError
from services.postforme.platform_map import to_pfm_platform
from services.postforme.schemas import CreateSocialPostBody, SocialPostMediaItem

logger = logging.getLogger("app")


def _strip_html(text: str) -> str:
    if not text:
        return ""
    t = re.sub(r"<[^>]+>", " ", text)
    t = unescape(t)
    return " ".join(t.split()).strip()


def _build_caption(post: Post) -> str:
    text = _strip_html((post.content_text or "").strip())
    tags = post.hashtags or []
    if not tags:
        return text
    line = " ".join(t if str(t).startswith("#") else f"#{t}" for t in tags)
    return f"{text}\n\n{line}" if text else line


def _media_from_post(post: Post) -> list[SocialPostMediaItem] | None:
    urls = post.media_urls or []
    items: list[SocialPostMediaItem] = []
    for u in urls:
        if not u or not isinstance(u, str):
            continue
        if u.startswith("https://") or u.startswith("http://"):
            items.append(SocialPostMediaItem(url=u))
    return items or None


def _apply_pfm_status_to_post(post: Post, pfm_status: str, *, now: datetime) -> None:
    s = (pfm_status or "").lower()
    if s in ("processed", "published", "completed", "success"):
        post.status = PostStatus.published
        post.published_at = now
    elif s in ("failed", "error"):
        post.status = PostStatus.failed
        if not post.publish_last_error:
            post.publish_last_error = f"Post for Me status: {pfm_status}"
    elif s == "scheduled":
        post.status = PostStatus.scheduled
    elif s == "processing":
        post.status = PostStatus.scheduled
    elif s == "draft":
        post.status = PostStatus.draft


async def _resolve_social_account_ids(
    client: PostForMeClient,
    *,
    company_id: str,
    platform: PlatformType,
    preferred_account_id: str | None,
) -> list[str]:
    pfm_platform = to_pfm_platform(platform)
    listing = await client.list_social_accounts(
        platforms=[pfm_platform],
        external_id=company_id,
        status=["connected"],
        limit=50,
        offset=0,
    )
    accounts = [a for a in listing.data if (a.status or "connected") == "connected"]
    if not accounts:
        raise ValueError(
            f"No connected Post for Me account for platform {platform.value}. Connect the platform first."
        )

    if preferred_account_id:
        for a in accounts:
            if a.id == preferred_account_id:
                return [a.id]
    return [accounts[0].id]


async def try_publish_post(
    db: AsyncSession,
    post: Post,
    *,
    force_immediate: bool = False,
) -> Post | None:
    settings = get_settings()
    if not settings.POSTFORME_API_KEY.strip():
        return None

    if post.external_publish_id:
        return post

    client = PostForMeClient(settings.POSTFORME_API_BASE, settings.POSTFORME_API_KEY)
    now = datetime.now(UTC)
    post.publish_attempted_at = now

    result = await db.execute(
        select(PlatformConnection).where(
            PlatformConnection.company_id == post.company_id,
            PlatformConnection.platform == post.platform,
            PlatformConnection.is_active.is_(True),
        )
    )
    conn = result.scalar_one_or_none()
    preferred = conn.account_id if conn and conn.account_id else None

    try:
        social_ids = await _resolve_social_account_ids(
            client,
            company_id=str(post.company_id),
            platform=post.platform,
            preferred_account_id=preferred,
        )
    except ValueError as e:
        post.status = PostStatus.failed
        post.publish_last_error = str(e)
        await db.commit()
        await db.refresh(post)
        return post

    caption = _build_caption(post)
    media = _media_from_post(post)

    scheduled_at: str | None = None
    if not force_immediate and post.scheduled_at:
        sched = post.scheduled_at
        if sched.tzinfo is None:
            sched = sched.replace(tzinfo=UTC)
        if sched > now:
            scheduled_at = sched.isoformat()

    body = CreateSocialPostBody(
        caption=caption or ".",
        social_accounts=social_ids,
        scheduled_at=scheduled_at,
        media=media,
        external_id=str(post.id),
        isDraft=False,
    )

    try:
        created = await client.create_social_post(body)
    except PostForMeClientError as e:
        post.status = PostStatus.failed
        post.publish_last_error = (e.body or str(e))[:5000]
        await db.commit()
        await db.refresh(post)
        return post

    post.external_publish_id = created.id
    post.publish_last_error = None
    _apply_pfm_status_to_post(post, created.status, now=now)
    await db.commit()
    await db.refresh(post)
    return post


async def try_publish_post_by_id(
    db: AsyncSession, post_id: str, *, force_immediate: bool = False
) -> Post | None:
    post = await db.get(Post, post_id)
    if post is None:
        return None
    return await try_publish_post(db, post, force_immediate=force_immediate)


async def try_publish_for_user_post(
    db: AsyncSession, post_id: str, user, *, force_immediate: bool = False
) -> Post | None:
    company = await get_company_for_user(db, user)
    post = await db.get(Post, post_id)
    if not post or not company or post.company_id != company.id:
        return None
    return await try_publish_post(db, post, force_immediate=force_immediate)


async def publish_due_scheduled_posts(db: AsyncSession) -> int:
    """Find and publish scheduled posts that are due (scheduled_at <= now).

    Also marks posts as expired if scheduled time has passed significantly.
    Returns the count of posts that were published.
    """
    settings = get_settings()
    now = datetime.now(UTC)

    # First, mark posts as expired if they're significantly past scheduled time (> 2 hours)
    expired_threshold = now - timedelta(hours=2)
    expired_result = await db.execute(
        select(Post).where(
            Post.status == PostStatus.scheduled,
            Post.scheduled_at.is_not(None),
            Post.scheduled_at < expired_threshold,
            Post.external_publish_id.is_(None),
        )
    )
    expired_posts = expired_result.scalars().all()
    for post in expired_posts:
        post.status = PostStatus.expired
        post.publish_last_error = "Scheduled time passed without being published"
    if expired_posts:
        await db.commit()
        logger.info("Marked %d posts as expired", len(expired_posts))

    if not settings.POSTFORME_API_KEY.strip():
        return 0

    # Find posts that are due for publishing (within 2 hours of scheduled time)
    due_result = await db.execute(
        select(Post).where(
            Post.status == PostStatus.scheduled,
            Post.scheduled_at.is_not(None),
            Post.scheduled_at <= now,
            Post.scheduled_at >= expired_threshold,
        )
    )
    posts = due_result.scalars().all()
    if not posts:
        return 0

    published_count = 0
    for post in posts:
        if post.external_publish_id:
            continue
        try:
            await try_publish_post(db, post, force_immediate=True)
            published_count += 1
        except Exception:
            logger.exception(
                "publish_due_scheduled_posts failed for post_id=%s", post.id
            )

    return published_count
