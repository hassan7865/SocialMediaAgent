from fastapi import BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.brand_voice import BrandVoice
from models.users import User
from services.common import get_company_for_user, to_dict


def _brand_voice_payload(brand_voice: BrandVoice | None):
    if brand_voice is None:
        return None
    return to_dict(
        brand_voice,
        [
            "id",
            "company_id",
            "tone",
            "created_at",
            "updated_at",
        ],
    )


async def get_brand_voice(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return None
    result = await db.execute(
        select(BrandVoice).where(BrandVoice.company_id == company.id)
    )
    return _brand_voice_payload(result.scalar_one_or_none())


async def analyze_brand_voice(
    tone_samples: list[str], background_tasks: BackgroundTasks
):
    background_tasks.add_task(lambda: None)
    return {
        "tone_samples": tone_samples,
        "analysis": {"style": "expert", "formality_level": 3},
    }


async def save_brand_voice(payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    result = await db.execute(
        select(BrandVoice).where(BrandVoice.company_id == company.id)
    )
    brand_voice = result.scalar_one_or_none()
    if brand_voice:
        for key, value in payload.model_dump(exclude_none=True).items():
            setattr(brand_voice, key, value)
    else:
        brand_voice = BrandVoice(
            company_id=company.id, **payload.model_dump(exclude_none=True)
        )
        db.add(brand_voice)
    await db.commit()
    await db.refresh(brand_voice)
    return _brand_voice_payload(brand_voice)


async def update_brand_voice(payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return None
    result = await db.execute(
        select(BrandVoice).where(BrandVoice.company_id == company.id)
    )
    brand_voice = result.scalar_one_or_none()
    if brand_voice is None:
        return None
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(brand_voice, key, value)
    await db.commit()
    await db.refresh(brand_voice)
    return _brand_voice_payload(brand_voice)


async def test_brand_voice(*_args, **_kwargs):
    return {"samples": ["Sample post 1", "Sample post 2", "Sample post 3"]}
