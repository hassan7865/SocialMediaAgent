import json
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.responses import success_response
from dependencies.db import get_db
from models.posts import Post, PostStatus

router = APIRouter(prefix="/api/webhooks/postforme", tags=["webhooks"])


@router.post("")
async def postforme_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    post_for_me_webhook_secret: str | None = Header(None, alias="Post-For-Me-Webhook-Secret"),
):
    settings = get_settings()
    if settings.POSTFORME_WEBHOOK_SECRET.strip():
        expected = settings.POSTFORME_WEBHOOK_SECRET.strip()
        if (post_for_me_webhook_secret or "").strip() != expected:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

    try:
        body = await request.json()
    except Exception:
        body = {}

    event_type = body.get("event_type")
    data = body.get("data") if isinstance(body.get("data"), dict) else {}

    if event_type == "social.post.result.created":
        pfm_post_id = data.get("post_id")
        success = data.get("success")
        err = data.get("error")
        if not pfm_post_id:
            return success_response("Ignored", {"ok": True})

        result = await db.execute(select(Post).where(Post.external_publish_id == str(pfm_post_id)))
        post = result.scalar_one_or_none()
        if post is None:
            ext = data.get("external_id")
            if ext:
                post = await db.get(Post, ext)
        if post is None:
            return success_response("No matching post", {"ok": True})

        now = datetime.now(UTC)
        if success is True:
            post.status = PostStatus.published
            post.published_at = now
            post.publish_last_error = None
        else:
            post.status = PostStatus.failed
            post.publish_last_error = json.dumps(err)[:5000] if err is not None else "Post for Me reported failure"
        await db.commit()

    return success_response("Webhook processed", {"ok": True})
