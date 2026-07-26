"""Add seller system columns: users, products, orders, withdrawals, conversations, community_posts fix

Revision ID: 0006_seller_system
Revises: 0005_fix_schema_idempotent
Create Date: 2026-06-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0006_seller_system"
down_revision = "0005_fix_schema_idempotent"
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

    # ── users: seller fields ──────────────────────────────────────────────────
    if not _has_column(conn, "users", "is_seller"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN is_seller BOOLEAN NOT NULL DEFAULT FALSE"
        ))
    if not _has_column(conn, "users", "seller_status"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN seller_status VARCHAR(20)"
        ))
    if not _has_column(conn, "users", "seller_business"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN seller_business VARCHAR(255)"
        ))
    if not _has_column(conn, "users", "seller_phone"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN seller_phone VARCHAR(50)"
        ))
    if not _has_column(conn, "users", "seller_nid"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN seller_nid VARCHAR(100)"
        ))
    if not _has_column(conn, "users", "seller_location"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN seller_location VARCHAR(100)"
        ))
    if not _has_column(conn, "users", "seller_description"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN seller_description TEXT"
        ))
    if not _has_column(conn, "users", "seller_referral_bonus"):
        conn.execute(sa.text(
            "ALTER TABLE users ADD COLUMN seller_referral_bonus FLOAT NOT NULL DEFAULT 0.0"
        ))

    # ── products: seller fields ───────────────────────────────────────────────
    if not _has_column(conn, "products", "seller_id"):
        conn.execute(sa.text(
            "ALTER TABLE products "
            "ADD COLUMN seller_id UUID REFERENCES users(id) ON DELETE SET NULL"
        ))
        conn.execute(sa.text(
            "CREATE INDEX IF NOT EXISTS ix_products_seller_id ON products(seller_id)"
        ))
    if not _has_column(conn, "products", "approval_status"):
        conn.execute(sa.text(
            "ALTER TABLE products "
            "ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'"
        ))
        conn.execute(sa.text(
            "CREATE INDEX IF NOT EXISTS ix_products_approval_status ON products(approval_status)"
        ))
    if not _has_column(conn, "products", "reject_reason"):
        conn.execute(sa.text(
            "ALTER TABLE products ADD COLUMN reject_reason TEXT"
        ))
    if not _has_column(conn, "products", "stock"):
        conn.execute(sa.text(
            "ALTER TABLE products ADD COLUMN stock INTEGER"
        ))

    # ── orders: seller_id ─────────────────────────────────────────────────────
    if not _has_column(conn, "orders", "seller_id"):
        conn.execute(sa.text(
            "ALTER TABLE orders "
            "ADD COLUMN seller_id UUID REFERENCES users(id) ON DELETE SET NULL"
        ))
        conn.execute(sa.text(
            "CREATE INDEX IF NOT EXISTS ix_orders_seller_id ON orders(seller_id)"
        ))

    # ── affiliate_withdrawals: withdrawal_type ────────────────────────────────
    if not _has_column(conn, "affiliate_withdrawals", "withdrawal_type"):
        conn.execute(sa.text(
            "ALTER TABLE affiliate_withdrawals "
            "ADD COLUMN withdrawal_type VARCHAR(20) NOT NULL DEFAULT 'affiliate'"
        ))
        conn.execute(sa.text(
            "CREATE INDEX IF NOT EXISTS ix_withdrawals_type "
            "ON affiliate_withdrawals(withdrawal_type)"
        ))

    # ── conversations: participant_type ───────────────────────────────────────
    if not _has_column(conn, "conversations", "participant_type"):
        conn.execute(sa.text(
            "ALTER TABLE conversations "
            "ADD COLUMN participant_type VARCHAR(20) NOT NULL DEFAULT 'customer'"
        ))
        conn.execute(sa.text(
            "CREATE INDEX IF NOT EXISTS ix_conversations_participant_type "
            "ON conversations(participant_type)"
        ))

    # ── community_posts: user_id (bug-fix for missing column from 0004) ───────
    if not _has_column(conn, "community_posts", "user_id"):
        conn.execute(sa.text(
            "ALTER TABLE community_posts "
            "ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL"
        ))


def downgrade() -> None:
    conn = op.get_bind()

    if _has_column(conn, "conversations", "participant_type"):
        conn.execute(sa.text("DROP INDEX IF EXISTS ix_conversations_participant_type"))
        conn.execute(sa.text("ALTER TABLE conversations DROP COLUMN participant_type"))

    if _has_column(conn, "affiliate_withdrawals", "withdrawal_type"):
        conn.execute(sa.text("DROP INDEX IF EXISTS ix_withdrawals_type"))
        conn.execute(sa.text("ALTER TABLE affiliate_withdrawals DROP COLUMN withdrawal_type"))

    if _has_column(conn, "orders", "seller_id"):
        conn.execute(sa.text("DROP INDEX IF EXISTS ix_orders_seller_id"))
        conn.execute(sa.text("ALTER TABLE orders DROP COLUMN seller_id"))

    for col in ("stock", "reject_reason", "approval_status", "seller_id"):
        if _has_column(conn, "products", col):
            conn.execute(sa.text(f"ALTER TABLE products DROP COLUMN {col}"))
    conn.execute(sa.text("DROP INDEX IF EXISTS ix_products_seller_id"))
    conn.execute(sa.text("DROP INDEX IF EXISTS ix_products_approval_status"))

    for col in ("seller_referral_bonus", "seller_description", "seller_location",
                "seller_nid", "seller_phone", "seller_business",
                "seller_status", "is_seller"):
        if _has_column(conn, "users", col):
            conn.execute(sa.text(f"ALTER TABLE users DROP COLUMN {col}"))
