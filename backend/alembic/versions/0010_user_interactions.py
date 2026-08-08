"""Add user_interactions table for the product discovery/recommendation
engine — tracks views, wishlist/cart actions, purchases, searches, and
category browsing per user, with timestamps for time-decayed scoring.

Revision ID: 0010_user_interactions
Revises: 0009_remove_admin_mock_data
Create Date: 2026-08-08 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0010_user_interactions"
down_revision = "0009_remove_admin_mock_data"
branch_labels = None
depends_on = None


def _has_table(conn, table: str) -> bool:
    result = conn.execute(sa.text(
        "SELECT 1 FROM information_schema.tables WHERE table_name=:t"
    ), {"t": table})
    return result.fetchone() is not None


def upgrade() -> None:
    conn = op.get_bind()

    if not _has_table(conn, "user_interactions"):
        conn.execute(sa.text(
            "CREATE TABLE user_interactions ("
            "id UUID PRIMARY KEY, "
            "user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, "
            "interaction_type VARCHAR(20) NOT NULL, "
            "product_id UUID REFERENCES products(id) ON DELETE CASCADE, "
            "category VARCHAR(100), "
            "search_query VARCHAR(255), "
            "created_at TIMESTAMPTZ NOT NULL DEFAULT now()"
            ")"
        ))
        conn.execute(sa.text(
            "CREATE INDEX ix_user_interactions_user_id ON user_interactions (user_id)"
        ))
        conn.execute(sa.text(
            "CREATE INDEX ix_user_interactions_product_id ON user_interactions (product_id)"
        ))
        conn.execute(sa.text(
            "CREATE INDEX ix_user_interactions_category ON user_interactions (category)"
        ))
        conn.execute(sa.text(
            "CREATE INDEX ix_user_interactions_interaction_type ON user_interactions (interaction_type)"
        ))
        conn.execute(sa.text(
            "CREATE INDEX ix_user_interactions_created_at ON user_interactions (created_at)"
        ))


def downgrade() -> None:
    conn = op.get_bind()
    if _has_table(conn, "user_interactions"):
        conn.execute(sa.text("DROP TABLE user_interactions"))
