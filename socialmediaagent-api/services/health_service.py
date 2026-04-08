from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def health_status(db: AsyncSession) -> dict:
    try:
        await db.execute(text("SELECT 1"))
        return {"database": "ok"}
    except Exception:
        return {"database": "down"}
