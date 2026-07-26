"""
User model.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Float, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_affiliate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    affiliate_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, nullable=True, index=True
    )
    affiliate_clicks: Mapped[int] = mapped_column(default=0, nullable=False)
    affiliate_sales: Mapped[int] = mapped_column(default=0, nullable=False)
    affiliate_commission_balance: Mapped[float] = mapped_column(default=0.0, nullable=False)
    referred_by: Mapped[str | None] = mapped_column(
        String(64), nullable=True, index=True
    )  # affiliate_id of the affiliate who invited this user
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_login_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Seller fields ──────────────────────────────────────────────────────────
    is_seller: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    seller_status: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # None | "pending" | "approved" | "rejected"
    seller_business: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seller_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    seller_nid: Mapped[str | None] = mapped_column(String(100), nullable=True)
    seller_location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    seller_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    seller_referral_bonus: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    affiliate_commission_override: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )  # If set, overrides product.commission_percent for this affiliate

    # Relationships
    cart: Mapped["Cart"] = relationship("Cart", back_populates="user", uselist=False)
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user", foreign_keys="[Order.user_id]")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user")
    withdrawals: Mapped[list["AffiliateWithdrawal"]] = relationship(
        "AffiliateWithdrawal", back_populates="user"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")