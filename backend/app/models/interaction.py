"""
UserInteraction model — records product discovery signals (views, wishlist,
cart adds, purchases, searches, category browsing) so the recommendation
engine can learn per-user preferences and compute trending scores.

Deliberately denormalized (category is copied onto the row at write time)
so preference/trending queries never need to join back to `products` for
the common case — keeps the recommendation queries fast.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

# Allowed values for `interaction_type` — kept as a plain string column
# (not a DB enum) so new interaction types can be added without a migration.
INTERACTION_TYPES = (
    "view",
    "wishlist_add",
    "wishlist_remove",
    "cart_add",
    "purchase",
    "search",
    "category_view",
)


class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    interaction_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=True, index=True
    )
    category: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    search_query: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    user: Mapped["User"] = relationship("User")
    product: Mapped["Product | None"] = relationship("Product")
