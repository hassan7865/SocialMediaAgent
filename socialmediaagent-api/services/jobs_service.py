from services.common import paginated_data
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.generation_jobs import GenerationJob, JobStatus
from models.users import User
from services.common import get_company_for_user
from services.common import to_dict


async def list_jobs(pagination, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return paginated_data([], 0, pagination.page, pagination.limit)
    count_q = await db.execute(select(func.count()).select_from(GenerationJob).where(GenerationJob.company_id == company.id))
    total = int(count_q.scalar_one() or 0)
    offset = (pagination.page - 1) * pagination.limit
    result = await db.execute(
        select(GenerationJob)
        .where(GenerationJob.company_id == company.id)
        .order_by(GenerationJob.id.desc())
        .offset(offset)
        .limit(pagination.limit)
    )
    jobs = [
        to_dict(
            job,
            [
                "id",
                "company_id",
                "job_type",
                "status",
                "config",
                "result_post_ids",
                "started_at",
                "completed_at",
            ],
        )
        for job in result.scalars().all()
    ]
    return paginated_data(jobs, total, pagination.page, pagination.limit)


async def get_job(job_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    job = await db.get(GenerationJob, job_id)
    if job and company and job.company_id == company.id:
        return to_dict(job, ["id", "company_id", "job_type", "status", "config", "result_post_ids", "started_at", "completed_at"])
    return {"id": job_id, "status": "queued"}


async def cancel_job(job_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    job = await db.get(GenerationJob, job_id)
    if job and company and job.company_id == company.id:
        job.status = JobStatus.failed
        await db.commit()
        await db.refresh(job)
        return to_dict(job, ["id", "company_id", "job_type", "status", "config", "result_post_ids", "started_at", "completed_at"])
    return {"id": job_id, "status": "failed"}
