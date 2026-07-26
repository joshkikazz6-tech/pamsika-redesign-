"""Add affiliate_commission_override to users

Revision ID: 0008_affiliate_commission_override
Revises: 0007_product_seller_price
Create Date: 2026-06-09 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0008_affiliate_commission_override"
down_revision = "0007_product_seller_price"
branch_labels = None
depends_on = None


def _has_column(conn, table: str, column: str) -> bool:
    result = conn.execute(sa.text(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_name=:t AND column_name=:c"
    ), {"t": table, "c": column})
    return result.fetchone() is not None


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, "users", "affiliate_commission_override"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN affiliate_commission_override FLOAT"
        ))


def downgrade() -> None:
    conn = op.get_bind()
    if _has_column(conn, "users", "affiliate_commission_override"):
        conn.execute(sa.text(
            "ALTER TABLE users DROP COLUMN affiliate_commission_override"
        ))