import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from core.config import get_settings
from core.database import AsyncSessionLocal
from core.paths import UPLOAD_ROOT, ensure_upload_dirs
from core.logging import RequestLoggingMiddleware
from core.responses import error_response
from routers import (
    admin_users,
    ai,
    analytics,
    auth,
    brand_voice,
    calendar,
    company,
    health,
    jobs,
    platforms,
    postforme_webhooks,
    posts,
)
from services.postforme.client import PostForMeClientError
from services.publish_service import publish_due_scheduled_posts


logger = logging.getLogger("app")

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Start background task to publish due scheduled posts
    async def scheduled_publish_loop():
        await asyncio.sleep(10)  # Wait for app to start
        while True:
            try:
                async with AsyncSessionLocal() as db:
                    await publish_due_scheduled_posts(db)
            except Exception:
                logger.exception("scheduled_publish_loop iteration failed")
            await asyncio.sleep(60)  # Check every minute

    task = asyncio.create_task(scheduled_publish_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="SocialMediaAgent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(auth.router)
app.include_router(company.router)
app.include_router(brand_voice.router)
app.include_router(platforms.router)
app.include_router(posts.router)
app.include_router(calendar.router)
app.include_router(analytics.router)
app.include_router(jobs.router)
app.include_router(health.router)
app.include_router(postforme_webhooks.router)
app.include_router(ai.router)

ensure_upload_dirs()
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=422, content=error_response("Validation error", exc.errors())
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_response(exc.detail))


def _map_postforme_upstream_status(upstream: int) -> int:
    if upstream >= 500:
        return 502
    if upstream == 404:
        return 424
    if upstream == 401:
        return 401
    if upstream == 403:
        return 403
    if upstream == 422:
        return 422
    if 400 <= upstream < 500:
        return 400
    return 502


@app.exception_handler(PostForMeClientError)
async def postforme_client_error_handler(
    _request: Request, exc: PostForMeClientError
) -> JSONResponse:
    message = str(exc)
    if exc.body:
        try:
            parsed = json.loads(exc.body)
            if isinstance(parsed, dict):
                message = str(parsed.get("message") or parsed.get("error") or message)
        except (json.JSONDecodeError, TypeError):
            pass
    upstream = exc.status_code or 0
    status = _map_postforme_upstream_status(upstream)
    logger.warning(
        "postforme_upstream_error http=%s mapped=%s %s", upstream, status, message[:400]
    )
    return JSONResponse(
        status_code=status,
        content=error_response(message, {"upstream_status": upstream}),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    _request: Request, _exc: Exception
) -> JSONResponse:
    return JSONResponse(
        status_code=500, content=error_response("Internal server error")
    )
