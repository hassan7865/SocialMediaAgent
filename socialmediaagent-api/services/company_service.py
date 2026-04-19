from datetime import UTC, datetime

from fastapi import BackgroundTasks, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from models.companies import Company
from models.generation_jobs import GenerationJob, JobStatus, JobType
from models.users import User
from services.common import get_company_for_user, to_dict


def _company_payload(company: Company | None):
    if company is None:
        return None
    return to_dict(
        company,
        [
            "id",
            "user_id",
            "name",
            "website",
            "description",
            "industry",
            "target_audience",
            "value_proposition",
            "differentiators",
            "key_messages",
        ],
    )


async def get_company_profile(db: AsyncSession, user: User):
    return _company_payload(await get_company_for_user(db, user))


async def create_company_profile(payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is not None:
        for key, value in payload.model_dump(exclude_none=True).items():
            setattr(company, key, value)
    else:
        company = Company(user_id=user.id, **payload.model_dump(exclude_none=True))
        db.add(company)
    await db.commit()
    await db.refresh(company)
    return _company_payload(company)


async def update_company_profile(payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return None
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(company, key, value)
    await db.commit()
    await db.refresh(company)
    return _company_payload(company)


async def scrape_company_website(url: str, background_tasks: BackgroundTasks, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    background_tasks.add_task(lambda: None)
    if company is not None and not company.website:
        company.website = url
        await db.commit()
    job_id = None
    if company is not None:
        job = GenerationJob(
            company_id=company.id,
            job_type=JobType.month_calendar,
            status=JobStatus.queued,
            config={"source": "company_scrape", "url": url},
            started_at=datetime.now(UTC),
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        job_id = str(job.id)
    return {"url": url, "extracted": {"website": url}, "job_id": job_id}


async def ingest_document(file: UploadFile, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    return {"accepted": True, "filename": file.filename, "company_id": str(company.id) if company else None}
