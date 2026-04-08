from datetime import UTC, datetime

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.content_calendar import CalendarStatus, ContentCalendar
from models.generation_jobs import GenerationJob, JobStatus, JobType
from models.users import User, UserRole
from services.common import get_company_for_user, to_dict


def _calendar_payload(item: ContentCalendar):
    return to_dict(item, ["id", "company_id", "week_start_date", "generated_at", "approved_by", "status"])


async def get_calendar(db: AsyncSession, user: User, week=None):
    company = await get_company_for_user(db, user)
    if company is None:
        return []
    conditions = [ContentCalendar.company_id == company.id]
    if week:
        conditions.append(ContentCalendar.week_start_date == week)
    result = await db.execute(
        select(ContentCalendar).where(and_(*conditions)).order_by(ContentCalendar.week_start_date.desc())
    )
    return [_calendar_payload(row) for row in result.scalars().all()]


async def generate_calendar(payload, background_tasks: BackgroundTasks, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    result = await db.execute(
        select(ContentCalendar).where(
            ContentCalendar.company_id == company.id, ContentCalendar.week_start_date == payload.week_start
        )
    )
    calendar = result.scalar_one_or_none()
    if calendar is None:
        calendar = ContentCalendar(
            company_id=company.id,
            week_start_date=payload.week_start,
            generated_at=datetime.now(UTC),
            status=CalendarStatus.draft,
        )
        db.add(calendar)
    else:
        calendar.generated_at = datetime.now(UTC)
        calendar.status = CalendarStatus.draft
    job = GenerationJob(
        company_id=company.id,
        job_type=JobType.weekly_calendar,
        status=JobStatus.queued,
        config=payload.model_dump(),
        started_at=datetime.now(UTC),
    )
    db.add(job)
    background_tasks.add_task(lambda: None)
    await db.commit()
    await db.refresh(calendar)
    await db.refresh(job)
    return {"queued": True, "calendar": _calendar_payload(calendar), "job_id": str(job.id)}


async def approve_all(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return {"approved": 0}
    result = await db.execute(
        select(ContentCalendar).where(ContentCalendar.company_id == company.id, ContentCalendar.status == CalendarStatus.draft)
    )
    calendars = result.scalars().all()
    for item in calendars:
        item.status = CalendarStatus.approved
        item.approved_by = user.id
    await db.commit()
    return {"approved": len(calendars)}


async def update_calendar(calendar_id: str, payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    calendar = await db.get(ContentCalendar, calendar_id)
    if not calendar or not company or calendar.company_id != company.id:
        return {"id": calendar_id}
    if payload.status is not None:
        requested_status = CalendarStatus(payload.status)
        if requested_status in {CalendarStatus.approved, CalendarStatus.live} and user.role != UserRole.admin and not user.can_review:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Reviewer permission required")
        if requested_status == CalendarStatus.approved:
            calendar.approved_by = user.id
        calendar.status = requested_status
    await db.commit()
    await db.refresh(calendar)
    return _calendar_payload(calendar)
