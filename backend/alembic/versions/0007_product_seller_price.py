"""Add seller_price and affiliate_commission_percent to products

Revision ID: 0007_product_seller_price
Revises: 0006_seller_system
Create Date: 2026-06-08 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0007_product_seller_price"
down_revision = "0006_seller_system"
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

    # seller_price — the price the seller originally submitted
    if not _has_column(conn, "products", "seller_price"):
        conn.execute(sa.text(
            "ALTER TABLE products ADD COLUMN seller_price FLOAT"
        ))
        # Backfill: existing products have seller_price = price
        conn.execute(sa.text(
            "UPDATE products SET seller_price = price WHERE seller_price IS NULL"
        ))

    # affiliate_commission_percent — separate from platform commission
    if not _has_column(conn, "products", "affiliate_commission_percent"):
        conn.execute(sa.text(
            "ALTER TABLE products "
            "ADD COLUMN affiliate_commission_percent FLOAT NOT NULL DEFAULT 5.0"
        ))
        # Backfill: copy existing commission_percent to affiliate_commission_percent
        conn.execute(sa.text(
            "UPDATE products SET affiliate_commission_percent = commission_percent"
        ))


def downgrade() -> None:
    conn = op.get_bind()
    for col in ("affiliate_commission_percent", "seller_price"):
        if _has_column(conn, "products", col):
            conn.execute(sa.text(f"ALTER TABLE products DROP COLUMN {col}"))