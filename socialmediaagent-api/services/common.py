import math
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.companies import Company
from models.users import User


def paginated_data(items: list[Any], total: int, page: int, limit: int) -> dict[str, Any]:
    pages = math.ceil(total / limit) if limit else 1
    return {"items": items, "total": total, "page": page, "pages": pages}


async def get_company_for_user(db: AsyncSession, user: User) -> Company | None:
    """Company is always owned by the user (`companies.user_id`)."""
    result = await db.execute(select(Company).where(Company.user_id == user.id))
    return result.scalar_one_or_none()


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
