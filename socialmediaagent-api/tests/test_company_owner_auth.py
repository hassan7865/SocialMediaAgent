import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from dependencies.auth import require_company_owner
from models.companies import Company
from models.users import User


@pytest.mark.asyncio
async def test_require_company_owner_allows_owner():
    uid = uuid.uuid4()
    user = User(id=uid, email="a@example.com", hashed_password="x", full_name=None)
    company = Company(id=uuid.uuid4(), user_id=uid, name="Acme")
    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=company)
    db = AsyncMock()
    db.execute = AsyncMock(return_value=result_mock)
    out = await require_company_owner(current_user=user, db=db)
    assert out == user


@pytest.mark.asyncio
async def test_require_company_owner_rejects_non_owner():
    uid = uuid.uuid4()
    user = User(id=uid, email="a@example.com", hashed_password="x", full_name=None)
    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=None)
    db = AsyncMock()
    db.execute = AsyncMock(return_value=result_mock)
    with pytest.raises(HTTPException) as ei:
        await require_company_owner(current_user=user, db=db)
    assert ei.value.status_code == 403
