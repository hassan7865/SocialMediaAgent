"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-04-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    op.execute("DROP TYPE IF EXISTS brand_voice_tone CASCADE")
    op.execute(
        "CREATE TYPE brand_voice_tone AS ENUM ('professional', 'casual', 'friendly', 'authoritative', 'humorous', 'inspirational')"
    )

    platform_type = postgresql.ENUM(
        "linkedin", "twitter", "instagram", "facebook", name="platform_type"
    )
    post_platform_type = postgresql.ENUM(
        "linkedin", "twitter", "instagram", "facebook", name="post_platform_type"
    )
    performance_platform_type = postgresql.ENUM(
        "linkedin", "twitter", "instagram", "facebook", name="performance_platform_type"
    )
    post_status = postgresql.ENUM(
        "draft",
        "scheduled",
        "published",
        "failed",
        "paused",
        "expired",
        name="post_status",
    )
    created_by = postgresql.ENUM("ai", "human", name="created_by")
    calendar_status = postgresql.ENUM(
        "draft", "approved", "live", name="calendar_status"
    )
    job_type = postgresql.ENUM(
        "single_post", "weekly_calendar", "month_calendar", name="job_type"
    )
    job_status = postgresql.ENUM(
        "queued", "running", "done", "failed", name="job_status"
    )

    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "companies",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("website", sa.String(length=512)),
        sa.Column("description", sa.Text()),
        sa.Column("industry", sa.String(length=255)),
        sa.Column("target_audience", sa.Text()),
        sa.Column("value_proposition", sa.Text()),
        sa.Column("differentiators", sa.Text()),
        sa.Column("key_messages", postgresql.JSONB()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_companies_user_id", "companies", ["user_id"])

    op.create_table(
        "brand_voice",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "company_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("companies.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column(
            "tone",
            sa.String(20),
            nullable=False,
            server_default="professional",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "platform_connections",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "company_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("companies.id"),
            nullable=False,
        ),
        sa.Column("platform", platform_type, nullable=False),
        sa.Column("access_token", sa.String(), nullable=False),
        sa.Column("refresh_token", sa.String(), nullable=True),
        sa.Column("account_id", sa.String(length=255), nullable=True),
        sa.Column("account_name", sa.String(length=255), nullable=True),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "ix_platform_connections_company_id", "platform_connections", ["company_id"]
    )

    op.create_table(
        "content_calendar",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "company_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("companies.id"),
            nullable=False,
        ),
        sa.Column("week_start_date", sa.Date(), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "approved_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("status", calendar_status, nullable=False),
    )
    op.create_index(
        "ix_content_calendar_company_id", "content_calendar", ["company_id"]
    )

    op.create_table(
        "posts",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "company_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("companies.id"),
            nullable=False,
        ),
        sa.Column("platform", post_platform_type, nullable=False),
        sa.Column("content_text", sa.Text(), nullable=False),
        sa.Column("hashtags", postgresql.JSONB(), nullable=True),
        sa.Column("media_urls", postgresql.JSONB(), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", post_status, nullable=False),
        sa.Column("created_by", created_by, nullable=False),
        sa.Column("external_publish_id", sa.String(length=255), nullable=True),
        sa.Column("publish_last_error", sa.Text(), nullable=True),
        sa.Column("publish_attempted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_posts_company_id", "posts", ["company_id"])

    op.create_table(
        "post_performance",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "post_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("posts.id"),
            nullable=False,
        ),
        sa.Column("platform", performance_platform_type, nullable=False),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("comments", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("shares", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("clicks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reach", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("engagement_rate", sa.Float(), nullable=False, server_default="0"),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_post_performance_post_id", "post_performance", ["post_id"])

    op.create_table(
        "generation_jobs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "company_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("companies.id"),
            nullable=False,
        ),
        sa.Column("job_type", job_type, nullable=False),
        sa.Column("status", job_status, nullable=False),
        sa.Column("config", postgresql.JSONB(), nullable=True),
        sa.Column("result_post_ids", postgresql.JSONB(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_generation_jobs_company_id", "generation_jobs", ["company_id"])


def downgrade() -> None:
    op.drop_index("ix_generation_jobs_company_id", table_name="generation_jobs")
    op.drop_table("generation_jobs")
    op.drop_index("ix_post_performance_post_id", table_name="post_performance")
    op.drop_table("post_performance")
    op.drop_index("ix_posts_company_id", table_name="posts")
    op.drop_table("posts")
    op.drop_index("ix_content_calendar_company_id", table_name="content_calendar")
    op.drop_table("content_calendar")
    op.drop_index(
        "ix_platform_connections_company_id", table_name="platform_connections"
    )
    op.drop_table("platform_connections")
    op.drop_table("brand_voice")
    op.drop_index("ix_companies_user_id", table_name="companies")
    op.drop_table("companies")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    for enum_name in [
        "job_status",
        "job_type",
        "calendar_status",
        "created_by",
        "post_status",
        "performance_platform_type",
        "post_platform_type",
        "platform_type",
        "brand_voice_tone",
    ]:
        postgresql.ENUM(name=enum_name).drop(op.get_bind(), checkfirst=True)
