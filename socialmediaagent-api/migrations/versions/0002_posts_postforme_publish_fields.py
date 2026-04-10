"""posts: Post for Me publish tracking columns

Revision ID: 0002_pfm_publish
Revises: 0001_initial_schema
Create Date: 2026-04-11
"""

import sqlalchemy as sa
from alembic import op

revision = "0002_pfm_publish"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("external_publish_id", sa.String(length=255), nullable=True))
    op.add_column("posts", sa.Column("publish_last_error", sa.Text(), nullable=True))
    op.add_column("posts", sa.Column("publish_attempted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("posts", "publish_attempted_at")
    op.drop_column("posts", "publish_last_error")
    op.drop_column("posts", "external_publish_id")
