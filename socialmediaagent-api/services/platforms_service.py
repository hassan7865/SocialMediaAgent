from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from models.platform_connections import PlatformConnection, PlatformType
from models.users import User
from services.common import get_company_for_user, to_dict
from services.postforme.client import PostForMeClient, PostForMeClientError
from services.postforme.platform_map import from_pfm_platform, local_platform_slug_from_pfm_name, to_pfm_platform


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


def _client_or_none() -> PostForMeClient | None:
    settings = get_settings()
    key = settings.POSTFORME_API_KEY.strip()
    if not key:
        return None
    return PostForMeClient(settings.POSTFORME_API_BASE, key)


async def list_platform_connections(db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        return []
    result = await db.execute(select(PlatformConnection).where(PlatformConnection.company_id == company.id))
    return [_platform_payload(item) for item in result.scalars().all()]


async def oauth_start(platform: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    client = _client_or_none()
    if client is None:
        raise ValueError("Post for Me is not configured (set POSTFORME_API_KEY)")
    try:
        platform_value = PlatformType(platform.lower())
    except ValueError as e:
        raise ValueError(f"Unsupported platform: {platform}") from e
    pfm_platform = to_pfm_platform(platform_value)
    auth = await client.create_social_account_auth_url(
        platform=pfm_platform,
        external_id=str(company.id),
        permissions=["posts"],
    )
    return {"platform": platform_value.value, "auth_url": auth.url}


async def sync_from_postforme(platform: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    if company is None:
        raise ValueError("Company profile is required")
    client = _client_or_none()
    if client is None:
        raise ValueError("Post for Me is not configured (set POSTFORME_API_KEY)")
    try:
        platform_value = PlatformType(platform.lower())
    except ValueError as e:
        raise ValueError(f"Unsupported platform: {platform}") from e
    pfm_platform = to_pfm_platform(platform_value)
    listing = await client.list_social_accounts(
        platforms=[pfm_platform],
        external_id=str(company.id),
        status=["connected"],
        limit=50,
        offset=0,
    )
    connected = [a for a in listing.data if (a.status or "connected") == "connected"]
    if not connected:
        result = await db.execute(
            select(PlatformConnection).where(
                PlatformConnection.company_id == company.id,
                PlatformConnection.platform == platform_value,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.is_active = False
            await db.commit()
            await db.refresh(existing)
            return _platform_payload(existing)
        raise ValueError("No connected account found in Post for Me for this platform yet. Finish OAuth in the browser.")

    account = connected[0]
    local_platform = from_pfm_platform(account.platform) or platform_value

    result = await db.execute(
        select(PlatformConnection).where(
            PlatformConnection.company_id == company.id,
            PlatformConnection.platform == local_platform,
        )
    )
    connection = result.scalar_one_or_none()
    now = datetime.now(UTC)
    if connection is None:
        connection = PlatformConnection(
            company_id=company.id,
            platform=local_platform,
            access_token="pfm_managed",
            account_name=account.username or account.user_id or local_platform.value,
            account_id=account.id,
            is_active=True,
            connected_at=now,
        )
        db.add(connection)
    else:
        connection.is_active = True
        connection.account_id = account.id
        connection.account_name = account.username or account.user_id or connection.account_name
        connection.connected_at = now
        connection.access_token = "pfm_managed"
    await db.commit()
    await db.refresh(connection)
    return _platform_payload(connection)


async def oauth_callback(platform: str, db: AsyncSession, user: User):
    return await sync_from_postforme(platform, db, user)


async def sync_all_from_postforme(db: AsyncSession, user: User, *, provider: str | None = None) -> dict:
    """Sync one or all platforms from Post for Me. Per-platform failures are collected (e.g. not connected yet)."""
    if provider is not None and str(provider).strip():
        slug = local_platform_slug_from_pfm_name(str(provider))
        try:
            PlatformType(slug)
        except ValueError as e:
            raise ValueError(f"Unsupported platform: {provider}") from e
        names = [slug]
    else:
        names = [p.value for p in PlatformType]

    synced: list[dict] = []
    errors: list[dict] = []
    for name in names:
        try:
            synced.append(await sync_from_postforme(name, db, user))
        except ValueError as e:
            errors.append({"platform": name, "error": str(e)})
    return {"synced": synced, "errors": errors}


async def delete_connection(connection_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    connection = await db.get(PlatformConnection, connection_id)
    if not connection or not company or connection.company_id != company.id:
        return {"deleted_id": connection_id}

    client = _client_or_none()
    if client and connection.account_id:
        try:
            await client.disconnect_social_account(connection.account_id)
        except PostForMeClientError:
            pass
    await db.delete(connection)
    await db.commit()
    return {"deleted_id": connection_id}


async def test_connection(connection_id: str, db: AsyncSession, user: User):
    company = await get_company_for_user(db, user)
    connection = await db.get(PlatformConnection, connection_id)
    if not connection or not company or connection.company_id != company.id:
        return {"id": connection_id, "valid": False}

    client = _client_or_none()
    if client is None or not connection.account_id:
        return {"id": connection_id, "valid": bool(connection.is_active)}

    pfm_platform = to_pfm_platform(connection.platform)
    try:
        listing = await client.list_social_accounts(
            platforms=[pfm_platform],
            external_id=str(company.id),
            status=["connected"],
            limit=50,
            offset=0,
        )
    except PostForMeClientError:
        return {"id": connection_id, "valid": False}

    ids = {a.id for a in listing.data}
    valid = connection.account_id in ids
    return {"id": connection_id, "valid": valid}
