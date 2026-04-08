from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.platform_connections import PlatformConnection, PlatformType
from models.users import User
from services.common import get_company_for_user, to_dict


def _platform_payload(connection: PlatformConnection):
    return to_dict(
        connection,
        [
            "id",
            "company_id",
            "platform",
            "account_id",
            "account_name",
            "token_expires_at",
            "is_active",
            "connected_at",
        ],
    )


async def list_platform_connections(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return []
    result = await db.execute(select(PlatformConnection).where(PlatformConnection.company_id == company.id))
    return [_platform_payload(item) for item in result.scalars().all()]


async def oauth_start(platform: str, *_args, **_kwargs):
    return {"platform": platform, "auth_url": f"https://oauth.example.com/{platform}"}


async def oauth_callback(platform: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    platform_value = PlatformType(platform.lower())
    result = await db.execute(
        select(PlatformConnection).where(
            PlatformConnection.company_id == company.id, PlatformConnection.platform == platform_value
        )
    )
    connection = result.scalar_one_or_none()
    if connection is None:
        connection = PlatformConnection(
            company_id=company.id,
            platform=platform_value,
            access_token="connected-token",
            account_name=f"{platform_value.value.title()} Account",
            account_id=f"{platform_value.value}-account",
            is_active=True,
            connected_at=datetime.now(UTC),
        )
        db.add(connection)
    else:
        connection.is_active = True
        connection.connected_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(connection)
    return _platform_payload(connection)


async def delete_connection(connection_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    connection = await db.get(PlatformConnection, connection_id)
    if connection and company and connection.company_id == company.id:
        await db.delete(connection)
        await db.commit()
    return {"deleted_id": connection_id}


async def test_connection(connection_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    connection = await db.get(PlatformConnection, connection_id)
    return {"id": connection_id, "valid": bool(connection and company and connection.company_id == company.id)}
