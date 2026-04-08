from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import hash_password
from core.responses import success_response
from dependencies.auth import require_admin
from dependencies.db import get_db
from models.company_users import CompanyUser
from models.users import User
from schemas.admin_users import CompanyMemberCreate, ReviewerPermissionUpdate
from services.common import get_company_for_user, to_dict

router = APIRouter(prefix="/api/admin/users", tags=["admin_users"], dependencies=[Depends(require_admin)])


@router.get("")
async def list_users(db: AsyncSession = Depends(get_db), _current_user: User = Depends(require_admin)):
    company = await get_company_for_user(db, _current_user)
    if company is None:
        return success_response("Users fetched", [])
    result = await db.execute(
        select(User)
        .join(CompanyUser, CompanyUser.user_id == User.id)
        .where(CompanyUser.company_id == company.id)
        .order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    payload = [to_dict(user, ["id", "email", "full_name", "role", "can_review", "created_at", "updated_at"]) for user in users]
    return success_response("Users fetched", payload)


@router.patch("/{user_id}/reviewer")
async def update_reviewer_permission(
    user_id: str,
    payload: ReviewerPermissionUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    company = await get_company_for_user(db, _current_user)
    if company is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company profile is required")
    member = await db.execute(
        select(CompanyUser).where(CompanyUser.company_id == company.id, CompanyUser.user_id == user_id)
    )
    if member.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not part of this company")
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.can_review = payload.can_review
    await db.commit()
    await db.refresh(user)
    return success_response("Reviewer permission updated", to_dict(user, ["id", "email", "full_name", "role", "can_review"]))


@router.post("/company-members")
async def add_company_member(
    payload: CompanyMemberCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    company = await get_company_for_user(db, _current_user)
    if company is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company profile is required")
    identifier = payload.identifier.strip()
    if not identifier:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Identifier is required")
    lookup = await db.execute(
        select(User).where(or_(User.email == identifier, User.full_name.ilike(identifier)))
    )
    user = lookup.scalar_one_or_none()
    if user is None:
        if "@" not in identifier:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found. Use an email to create a new user.")
        user = User(
            email=identifier.lower(),
            full_name=payload.full_name,
            hashed_password=hash_password("start@123"),
        )
        db.add(user)
        await db.flush()
    existing = await db.execute(
        select(CompanyUser).where(CompanyUser.company_id == company.id, CompanyUser.user_id == user.id)
    )
    if existing.scalar_one_or_none() is None:
        db.add(CompanyUser(company_id=company.id, user_id=user.id))
    await db.commit()
    return success_response("Company member added", to_dict(user, ["id", "email", "full_name", "role", "can_review"]))
