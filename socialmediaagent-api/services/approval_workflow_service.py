from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.approval_workflows import ApprovalWorkflow, ApprovalMode
from models.posts import ApprovalStatus, Post
from models.users import User
from services.common import get_company_for_user, get_company_user_ids, to_dict


async def get_workflow(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return {"mode": "full_review", "reviewer_user_ids": []}
    result = await db.execute(select(ApprovalWorkflow).where(ApprovalWorkflow.company_id == company.id))
    workflow = result.scalar_one_or_none()
    if workflow is None:
        return {"mode": "full_review", "reviewer_user_ids": []}
    return to_dict(workflow, ["id", "company_id", "mode", "reviewer_user_ids", "created_at", "updated_at"])


async def update_workflow(payload, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    reviewer_ids = payload.reviewer_user_ids or []
    company_user_ids = await get_company_user_ids(db, company.id)
    invalid_ids = [reviewer_id for reviewer_id in reviewer_ids if reviewer_id not in company_user_ids]
    if invalid_ids:
        raise ValueError("All reviewer users must belong to the current company")

    result = await db.execute(select(ApprovalWorkflow).where(ApprovalWorkflow.company_id == company.id))
    workflow = result.scalar_one_or_none()
    if workflow is None:
        workflow = ApprovalWorkflow(
            company_id=company.id,
            mode=ApprovalMode(payload.mode),
            reviewer_user_ids=reviewer_ids,
        )
        db.add(workflow)
    else:
        workflow.mode = ApprovalMode(payload.mode)
        workflow.reviewer_user_ids = reviewer_ids
    await db.commit()
    await db.refresh(workflow)
    return to_dict(workflow, ["id", "company_id", "mode", "reviewer_user_ids", "created_at", "updated_at"])


async def get_approval_queue(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return []
    result = await db.execute(
        select(Post).where(Post.company_id == company.id, Post.approval_status == ApprovalStatus.pending)
    )
    return [
        to_dict(
            post,
            [
                "id",
                "company_id",
                "platform",
                "content_text",
                "scheduled_at",
                "published_at",
                "status",
                "approval_status",
                "created_at",
                "updated_at",
                "external_publish_id",
                "publish_last_error",
            ],
        )
        for post in result.scalars().all()
    ]
