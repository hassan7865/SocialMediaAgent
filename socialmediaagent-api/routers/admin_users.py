from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.responses import success_response
from dependencies.auth import require_company_owner
from dependencies.db import get_db
from models.users import User
from services.common import get_company_for_user, to_dict

router = APIRouter(
    prefix="/api/admin/users",
    tags=["admin_users"],
    dependencies=[Depends(require_company_owner)],
)


@router.get("")
async def list_company_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_owner),
):
    """Single-user model: returns the company owner account only."""
    company = await get_company_for_user(db, current_user)
    if company is None:
        return success_response("Users fetched", [])
    owner = await db.get(User, company.user_id)
    if owner is None:
        return success_response("Users fetched", [])
    row = to_dict(owner, ["id", "email", "full_name", "created_at", "updated_at"])
    row["is_company_owner"] = True
    return success_response("Users fetched", [row])
