"""
Schemas for the product discovery / recommendation feed.
"""

import uuid
from typing import List, Literal, Optional
from pydantic import BaseModel

from app.schemas.product import ProductOut

# Kept as a plain Literal (not imported from app.models.interaction) —
# schemas in this codebase never import from models directly, since
# app/db/__init__.py eagerly imports every model for relationship
# resolution and that creates a circular import if a schema module is
# ever imported before the models package has finished initializing.
InteractionType = Literal[
    "view", "wishlist_add", "wishlist_remove", "cart_add",
    "purchase", "search", "category_view",
]


class InteractionCreate(BaseModel):
    interaction_type: InteractionType
    product_id: Optional[uuid.UUID] = None
    category: Optional[str] = None
    search_query: Optional[str] = None


class FeedResponse(BaseModel):
    items: List[ProductOut]
    page: int
    per_page: int
    has_more: bool
