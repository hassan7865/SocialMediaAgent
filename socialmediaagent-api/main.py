from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import get_settings
from core.logging import RequestLoggingMiddleware
from core.responses import error_response
from routers import admin_users, analytics, approval_workflow, auth, brand_voice, calendar, company, health, jobs, platforms, posts

settings = get_settings()
app = FastAPI(title="SocialMediaAgent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(auth.router)
app.include_router(admin_users.router)
app.include_router(company.router)
app.include_router(brand_voice.router)
app.include_router(platforms.router)
app.include_router(posts.router)
app.include_router(calendar.router)
app.include_router(approval_workflow.workflow_router)
app.include_router(approval_workflow.queue_router)
app.include_router(analytics.router)
app.include_router(jobs.router)
app.include_router(health.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content=error_response("Validation error", exc.errors()))


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_response(exc.detail))


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content=error_response("Internal server error"))
