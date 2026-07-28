"""Wire remaining mock-data surfaces to the backend: richer promo codes,
community post tagging, comment likes, conversation resolved flag, and
order-level promo/discount tracking.

Revision ID: 0009_remove_admin_mock_data
Revises: 0008_affiliate_commission_override
Create Date: 2026-07-27 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0009_remove_admin_mock_data"
down_revision = "0008_affiliate_commission_override"
branch_labels = None
depends_on = None


def _has_column(conn, table: str, column: str) -> bool:
    result = conn.execute(sa.text(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_name=:t AND column_name=:c"
    ), {"t": table, "c": column})
    return result.fetchone() is not None


def _has_table(conn, table: str) -> bool:
    result = conn.execute(sa.text(
        "SELECT 1 FROM information_schema.tables WHERE table_name=:t"
    ), {"t": table})
    return result.fetchone() is not None


def upgrade() -> None:
    conn = op.get_bind()

    # promo_codes — richer admin promo form
    promo_cols = {
        "title": "VARCHAR(120)",
        "description": "VARCHAR(500)",
        "discount_type": "VARCHAR(20) DEFAULT 'percentage' NOT NULL",
        "min_spend": "FLOAT DEFAULT 0",
        "applicable_category": "VARCHAR(64)",
    }
    for col, ddl in promo_cols.items():
        if not _has_column(conn, "promo_codes", col):
            conn.execute(sa.text(f"ALTER TABLE promo_codes ADD COLUMN {col} {ddl}"))

    # community_posts — category tag + tagged product
    if not _has_column(conn, "community_posts", "category_tag"):
        conn.execute(sa.text("ALTER TABLE community_posts ADD COLUMN category_tag VARCHAR(64)"))
    if not _has_column(conn, "community_posts", "tagged_product_id"):
        conn.execute(sa.text(
            "ALTER TABLE community_posts ADD COLUMN tagged_product_id UUID "
            "REFERENCES products(id) ON DELETE SET NULL"
        ))

    # comment_likes — new table
    if not _has_table(conn, "comment_likes"):
        conn.execute(sa.text(
            "CREATE TABLE comment_likes ("
            "id UUID PRIMARY KEY, "
            "comment_id UUID NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE, "
            "user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE"
            ")"
        ))
        conn.execute(sa.text(
            "CREATE INDEX ix_comment_likes_comment_id ON comment_likes (comment_id)"
        ))

    # conversations — resolved flag for the admin inbox tab
    if not _has_column(conn, "conversations", "resolved"):
        conn.execute(sa.text(
            "ALTER TABLE conversations ADD COLUMN resolved BOOLEAN DEFAULT FALSE NOT NULL"
        ))

    # orders — promo application tracking
    if not _has_column(conn, "orders", "promo_code"):
        conn.execute(sa.text("ALTER TABLE orders ADD COLUMN promo_code VARCHAR(32)"))
    if not _has_column(conn, "orders", "discount_amount"):
        conn.execute(sa.text("ALTER TABLE orders ADD COLUMN discount_amount FLOAT DEFAULT 0 NOT NULL"))


def downgrade() -> None:
    conn = op.get_bind()
    for table, col in [
        ("promo_codes", "title"), ("promo_codes", "description"),
        ("promo_codes", "discount_type"), ("promo_codes", "min_spend"),
        ("promo_codes", "applicable_category"),
        ("community_posts", "category_tag"), ("community_posts", "tagged_product_id"),
        ("conversations", "resolved"),
        ("orders", "promo_code"), ("orders", "discount_amount"),
    ]:
        if _has_column(conn, table, col):
            conn.execute(sa.text(f"ALTER TABLE {table} DROP COLUMN {col}"))
    if _has_table(conn, "comment_likes"):
        conn.execute(sa.text("DROP TABLE comment_likes"))
