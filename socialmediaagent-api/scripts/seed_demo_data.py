import asyncio
from datetime import UTC, datetime, timedelta
from pathlib import Path
import sys

from sqlalchemy import select

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from core.database import AsyncSessionLocal
from core.security import hash_password
from models.companies import Company
from models.platform_connections import PlatformType
from models.posts import CreatedBy, Post, PostStatus
from models.users import User

OWNER_EMAIL = "owner@demo.example"
DEFAULT_PASSWORD = "start@123"
COMPANY_NAME = "Demo Company"


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == OWNER_EMAIL))
        owner = result.scalar_one_or_none()
        if owner is None:
            owner = User(
                email=OWNER_EMAIL,
                hashed_password=hash_password(DEFAULT_PASSWORD),
                full_name="Demo Owner",
            )
            session.add(owner)
            await session.flush()
        else:
            owner.full_name = owner.full_name or "Demo Owner"
            await session.flush()

        company_result = await session.execute(select(Company).where(Company.user_id == owner.id))
        company = company_result.scalar_one_or_none()
        if company is None:
            company = Company(
                user_id=owner.id,
                name=COMPANY_NAME,
                website="https://demo.local",
                description="Demo company profile for local development.",
                industry="SaaS",
                target_audience="Small business marketing teams",
                value_proposition="Automated social media planning and publishing",
                differentiators="Fast setup, multi-platform publishing",
                key_messages=["Save time", "Improve consistency", "Scale content operations"],
            )
            session.add(company)
            await session.flush()
        else:
            company.name = COMPANY_NAME
            await session.flush()

        marker_texts = {
            "Demo post: product launch teaser for next week.",
            "Demo post: customer success quote with CTA.",
            "Demo post: feature highlight carousel draft.",
        }
        existing_posts_result = await session.execute(select(Post).where(Post.company_id == company.id))
        existing_texts = {post.content_text for post in existing_posts_result.scalars().all()}

        for idx, text in enumerate(marker_texts):
            if text in existing_texts:
                continue
            scheduled_at = datetime.now(UTC) + timedelta(days=idx + 1)
            session.add(
                Post(
                    company_id=company.id,
                    platform=PlatformType.linkedin,
                    content_text=text,
                    hashtags=["#demo", "#socialmedia"],
                    media_urls=[],
                    scheduled_at=scheduled_at,
                    status=PostStatus.scheduled,
                    created_by=CreatedBy.human,
                )
            )

        await session.commit()

    print("Demo data seeded.")
    print(f"Sign in: {OWNER_EMAIL} / {DEFAULT_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
