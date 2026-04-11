from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import get_current_user
from dependencies.db import get_db
from dependencies.pagination import PaginationParams, get_pagination_params
from models.users import User
from schemas.posts import PostCreate, PostUpdate
from services import posts_service

router = APIRouter(prefix="/api/posts", tags=["posts"], dependencies=[Depends(get_current_user)])


@router.post("/upload-media")
async def upload_post_media(
    request: Request,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        data = await posts_service.upload_post_media(file, request, db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return success_response("Media uploaded", data)


@router.get("")
async def list_posts(
    pagination: PaginationParams = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return success_response("Posts fetched", await posts_service.list_posts(pagination, db, current_user))


@router.get("/{post_id}")
async def get_post(post_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Post fetched", await posts_service.get_post(post_id, db, current_user))


@router.post("")
async def create_post(payload: PostCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        data = await posts_service.create_post(payload, db, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return success_response("Post created", data)


@router.patch("/{post_id}")
async def update_post(post_id: str, payload: PostUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Post updated", await posts_service.update_post(post_id, payload, db, current_user))


@router.delete("/{post_id}")
async def delete_post(post_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Post deleted", await posts_service.delete_post(post_id, db, current_user))


@router.post("/{post_id}/approve")
async def approve_post(post_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        data = await posts_service.approve_post(post_id, db, current_user)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    return success_response("Post approved", data)


@router.post("/{post_id}/reject")
async def reject_post(post_id: str, reason: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        data = await posts_service.reject_post(post_id, reason, db, current_user)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    return success_response("Post rejected", data)


@router.post("/{post_id}/publish-now")
async def publish_now(post_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        payload = await posts_service.publish_now(post_id, db, current_user)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return success_response("Post published", payload)


@router.post("/generate")
async def generate_post(payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Post generation started", await posts_service.generate_post(payload, background_tasks, db, current_user))


@router.get("/{post_id}/performance")
async def post_performance(post_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response("Post performance", await posts_service.get_post_performance(post_id, db, current_user))
