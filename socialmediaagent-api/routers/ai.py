import asyncio
import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from dependencies import get_current_user, get_db

logger = logging.getLogger(__name__)
from models.users import User
from services.ai_service import ai_service
from services.company_service import get_company_profile
from services.brand_voice_service import get_brand_voice
from services.platforms_service import list_platform_connections


router = APIRouter(prefix="/api/ai", tags=["ai"])

_generation_guard = asyncio.Lock()
_user_in_flight: set[int] = set()


class GeneratePostRequest(BaseModel):
    prompt: str
    platform: str = "linkedin"


class GeneratePostResponse(BaseModel):
    content: str


def _sse_error_payload(exc: BaseException) -> dict:
    return {"error": str(exc)[:4000]}


@router.post("/generate", response_model=GeneratePostResponse)
async def generate_post(
    request: GeneratePostRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = await get_company_profile(db, current_user)
    if not company:
        return GeneratePostResponse(content="")

    connections = await list_platform_connections(db, current_user)
    if not connections:
        raise HTTPException(
            status_code=403,
            detail="No social media accounts connected. Please connect at least one account in Settings > Social Accounts to generate posts.",
        )

    brand_voice = await get_brand_voice(db, current_user)

    try:
        if brand_voice and brand_voice.get("tone"):
            content = await ai_service.generate_with_brand_voice(
                user_prompt=request.prompt,
                company_name=company["name"],
                tone=brand_voice["tone"],
            )
        else:
            content = await ai_service.generate_post(
                user_prompt=request.prompt,
                system_prompt="You are an expert social media content writer. Create engaging, well-structured posts.",
            )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return GeneratePostResponse(content=content)


@router.post("/generate-stream")
async def generate_post_stream(
    request: GeneratePostRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    async def event_stream():
        async with _generation_guard:
            if current_user.id in _user_in_flight:
                yield (
                    "data: "
                    + json.dumps(
                        {
                            "error": (
                                "Another generation is already in progress. Please wait."
                            )
                        }
                    )
                    + "\n\n"
                )
                return
            _user_in_flight.add(current_user.id)
        try:
            company = await get_company_profile(db, current_user)
            if not company:
                yield f"data: {json.dumps({'error': 'Company profile is required.'})}\n\n"
                return
            connections = await list_platform_connections(db, current_user)
            if not connections:
                yield f"data: {json.dumps({'error': 'No social media accounts connected. Please connect at least one account in Settings > Social Accounts to generate posts.'})}\n\n"
                return
            brand_voice = await get_brand_voice(db, current_user)
            if brand_voice and brand_voice.get("tone"):
                stream = ai_service.stream_with_brand_voice(
                    user_prompt=request.prompt,
                    company_name=company["name"],
                    tone=brand_voice["tone"],
                )
            else:
                stream = ai_service.stream_default_writer(request.prompt)

            async for piece in stream:
                if piece:
                    yield f"data: {json.dumps({'text': piece})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except ValueError as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        except Exception as exc:
            logger.exception("ai generate-stream failed")
            yield f"data: {json.dumps(_sse_error_payload(exc))}\n\n"
        finally:
            async with _generation_guard:
                _user_in_flight.discard(current_user.id)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
