import asyncio
from datetime import UTC, datetime, timedelta
from pathlib import Path
import sys

from sqlalchemy import select

# Allow running this file directly from scripts/
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from core.database import AsyncSessionLocal
from core.security import hash_password
from models.companies import Company
from models.company_users import CompanyUser
from models.platform_connections import PlatformType
from models.posts import ApprovalStatus, CreatedBy, Post, PostStatus
from models.users import User, UserRole

ADMIN_EMAIL = "admin@demo.example"
USER_EMAIL = "user@demo.example"
DEFAULT_PASSWORD = "start@123"
COMPANY_NAME = "Demo Company"


async def get_or_create_user(session, email: str, full_name: str, role: UserRole, can_review: bool) -> User:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        updated = False
        if user.full_name != full_name:
            user.full_name = full_name
            updated = True
        if user.role != role:
            user.role = role
            updated = True
        if user.can_review != can_review:
            user.can_review = can_review
            updated = True
        if updated:
            await session.flush()
        return user

    user = User(
        email=email,
        hashed_password=hash_password(DEFAULT_PASSWORD),
        full_name=full_name,
        role=role,
        can_review=can_review,
    )
    session.add(user)
    await session.flush()
    return user


async def ensure_company_member(session, company_id, user_id) -> None:
    existing = await session.execute(
        select(CompanyUser).where(CompanyUser.company_id == company_id, CompanyUser.user_id == user_id)
    )
    if existing.scalar_one_or_none() is None:
        session.add(CompanyUser(company_id=company_id, user_id=user_id))
        await session.flush()


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        admin = await get_or_create_user(session, ADMIN_EMAIL, "Demo Admin", UserRole.admin, True)
        user = await get_or_create_user(session, USER_EMAIL, "Demo User", UserRole.user, False)

        company_result = await session.execute(select(Company).where(Company.user_id == admin.id))
        company = company_result.scalar_one_or_none()
        if company is None:
            company = Company(
                user_id=admin.id,
                name=COMPANY_NAME,
                website="https://demo.local",
                description="Demo company profile for local development.",
                industry="SaaS",
                target_audience="Small business marketing teams",
                value_proposition="Automated social media planning and publishing",
                differentiators="Fast setup, approval workflows, role-based access",
                key_messages=["Save time", "Improve consistency", "Scale content operations"],
            )
            session.add(company)
            await session.flush()
        else:
            company.name = COMPANY_NAME
            await session.flush()

        await ensure_company_member(session, company.id, admin.id)
        await ensure_company_member(session, company.id, user.id)

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
                    approval_status=ApprovalStatus.pending,
                    created_by=CreatedBy.human,
                )
            )

        await session.commit()

    print("Demo data seeded.")
    print(f"Admin user: {ADMIN_EMAIL} / {DEFAULT_PASSWORD}")
    print(f"Regular user: {USER_EMAIL} / {DEFAULT_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
