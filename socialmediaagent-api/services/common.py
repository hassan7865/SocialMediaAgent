import math
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.companies import Company
from models.company_users import CompanyUser
from models.users import User


def paginated_data(items: list[Any], total: int, page: int, limit: int) -> dict[str, Any]:
    pages = math.ceil(total / limit) if limit else 1
    return {"items": items, "total": total, "page": page, "pages": pages}


async def get_company_for_user(db: AsyncSession, user: User) -> Company | None:
    owner_result = await db.execute(select(Company).where(Company.user_id == user.id))
    owner_company = owner_result.scalar_one_or_none()
    if owner_company is not None:
        return owner_company
    member_result = await db.execute(
        select(Company).join(CompanyUser, CompanyUser.company_id == Company.id).where(CompanyUser.user_id == user.id)
    )
    return member_result.scalar_one_or_none()


async def get_company_user_ids(db: AsyncSession, company_id) -> set[str]:
    result = await db.execute(select(CompanyUser.user_id).where(CompanyUser.company_id == company_id))
    ids = {str(user_id) for user_id in result.scalars().all()}
    return ids


async def require_company_for_user(db: AsyncSession, user: User) -> Company:
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    return company


def to_dict(model: Any, fields: list[str]) -> dict[str, Any]:
    data: dict[str, Any] = {}
    for field in fields:
        value = getattr(model, field)
        if hasattr(value, "value"):
            value = value.value
        if hasattr(value, "isoformat"):
            value = value.isoformat()
        if value is not None and not isinstance(value, (str, int, float, bool, list, dict)):
            value = str(value)
        data[field] = value
    return data
