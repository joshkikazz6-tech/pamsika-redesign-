"""
Product discovery feed endpoints — dedicated router (prefix "/feed") kept
separate from products.py's `/products` routes on purpose:

  1. Path collision — FastAPI matches routes in registration order, and
     products.py already registers `/products/{product_id}` as a catch-all;
     nesting `/products/feed` here would risk being shadowed by it depending
     on router include order.
  2. Separation of concerns — recommendation/feed logic stays out of the
     plain product listing endpoint, per the "don't overload /products"
     requirement.
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductOut
from app.schemas.recommendation import InteractionCreate, FeedResponse
from app.api.deps import get_current_user, get_current_user_optional
from app.services import recommendations as reco

router = APIRouter(prefix="/feed", tags=["recommendations"])


@router.get("", response_model=FeedResponse)
async def get_feed(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Hybrid discovery feed for the homepage — personalized for logged-in
    users, trending/new/random for guests. See services/recommendations.py
    for the mix ratios.
    """
    items, has_more = await reco.build_feed(db, current_user, page=page, per_page=per_page)
    return FeedResponse(items=items, page=page, per_page=per_page, has_more=has_more)


@router.get("/recently-viewed", response_model=list[ProductOut])
async def recently_viewed(
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await reco.get_recently_viewed(db, current_user.id, limit)


@router.post("/interactions", status_code=201)
async def log_interaction(
    payload: InteractionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await reco.record_interaction(
        db,
        user_id=current_user.id,
        interaction_type=payload.interaction_type,
        product_id=payload.product_id,
        category=payload.category,
        search_query=payload.search_query,
    )
    return {"detail": "logged"}
