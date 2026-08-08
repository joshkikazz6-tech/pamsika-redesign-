"""
Recommendation engine service.

Separated from the API layer so interaction tracking, preference scoring,
trending calculation, and feed assembly can each be tested/reasoned about
independently — the `feed` router stays a thin HTTP wrapper around this.
"""

import logging
import random
import uuid
from typing import Iterable, Optional

from sqlalchemy import select, func, or_, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interaction import UserInteraction
from app.models.product import Product
from app.models.user import User

logger = logging.getLogger(__name__)

# Decay half-life (days) for time-weighted scoring — interactions older than
# this count for roughly half as much, older still count for a quarter, etc.
PREFERENCE_DECAY_DAYS = 30.0
TRENDING_DECAY_DAYS = 3.0

# How much each interaction type counts toward preference/trending scores.
PREFERENCE_WEIGHTS = {
    "view": 1.0,
    "category_view": 1.0,
    "search": 2.0,
    "wishlist_add": 3.0,
    "cart_add": 4.0,
    "purchase": 6.0,
}
TRENDING_WEIGHTS = {
    "view": 1.0,
    "wishlist_add": 3.0,
    "cart_add": 4.0,
    "purchase": 8.0,
}


def _active(q):
    """Same visibility rule as the public products endpoint — approved,
    active, not soft-deleted."""
    return q.where(
        Product.is_active == True,  # noqa: E712
        Product.deleted_at.is_(None),
        Product.approval_status == "approved",
    )


def _exclude(q, exclude_ids: Optional[Iterable[uuid.UUID]]):
    if exclude_ids:
        q = q.where(Product.id.notin_(list(exclude_ids)))
    return q


# ── Interaction tracking ───────────────────────────────────────────────────

async def record_interaction(
    db: AsyncSession,
    user_id: uuid.UUID,
    interaction_type: str,
    product_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    search_query: Optional[str] = None,
) -> None:
    """
    Best-effort interaction logging. Never raises — a tracking failure
    should never break checkout, cart, wishlist, or product browsing.
    """
    try:
        db.add(UserInteraction(
            user_id=user_id,
            interaction_type=interaction_type,
            product_id=product_id,
            category=category,
            search_query=search_query,
        ))
        await db.flush()
    except Exception:
        logger.warning("Failed to record interaction (%s) for user %s", interaction_type, user_id, exc_info=True)


# ── Recently viewed ─────────────────────────────────────────────────────────

async def get_recently_viewed(db: AsyncSession, user_id: uuid.UUID, limit: int = 20) -> list[Product]:
    # Most recent view timestamp per product, deduplicated.
    latest_view = (
        select(
            UserInteraction.product_id,
            func.max(UserInteraction.created_at).label("last_viewed"),
        )
        .where(
            UserInteraction.user_id == user_id,
            UserInteraction.interaction_type == "view",
            UserInteraction.product_id.isnot(None),
        )
        .group_by(UserInteraction.product_id)
        .order_by(func.max(UserInteraction.created_at).desc())
        .limit(limit)
        .subquery()
    )
    q = _active(select(Product)).join(latest_view, Product.id == latest_view.c.product_id)
    q = q.order_by(latest_view.c.last_viewed.desc())
    result = await db.execute(q)
    return list(result.scalars().all())


# ── Preference learning ─────────────────────────────────────────────────────

async def get_user_category_scores(db: AsyncSession, user_id: uuid.UUID) -> dict[str, float]:
    """
    Weighted, time-decayed interest score per category, inferred from views,
    searches, wishlist/cart actions, and purchases.
    """
    weight_case = case(
        *[(UserInteraction.interaction_type == k, v) for k, v in PREFERENCE_WEIGHTS.items()],
        else_=0.0,
    )
    # Exponential decay: weight * 0.5 ^ (age_days / half_life)
    age_days = func.extract("epoch", func.now() - UserInteraction.created_at) / 86400.0
    decayed_weight = weight_case * func.pow(0.5, age_days / PREFERENCE_DECAY_DAYS)

    q = (
        select(UserInteraction.category, func.sum(decayed_weight).label("score"))
        .where(
            UserInteraction.user_id == user_id,
            UserInteraction.category.isnot(None),
        )
        .group_by(UserInteraction.category)
        .order_by(func.sum(decayed_weight).desc())
    )
    result = await db.execute(q)
    return {row.category: float(row.score) for row in result.all() if row.score}


# ── Trending ─────────────────────────────────────────────────────────────

async def get_trending_products(
    db: AsyncSession, limit: int, exclude_ids: Optional[Iterable[uuid.UUID]] = None
) -> list[Product]:
    """
    Trending = recent, decayed interaction activity (views/wishlist/cart/
    purchase), with a small baseline from lifetime views so products with no
    interaction history yet (e.g. right after this feature ships) still get
    a reasonable ordering instead of all tying at zero.
    """
    weight_case = case(
        *[(UserInteraction.interaction_type == k, v) for k, v in TRENDING_WEIGHTS.items()],
        else_=0.0,
    )
    age_days = func.extract("epoch", func.now() - UserInteraction.created_at) / 86400.0
    decayed_weight = weight_case * func.pow(0.5, age_days / TRENDING_DECAY_DAYS)

    recent_score = (
        select(
            UserInteraction.product_id.label("product_id"),
            func.sum(decayed_weight).label("score"),
        )
        .where(UserInteraction.product_id.isnot(None))
        .group_by(UserInteraction.product_id)
        .subquery()
    )

    q = _active(select(Product, func.coalesce(recent_score.c.score, 0.0).label("trend_score")))
    q = q.outerjoin(recent_score, Product.id == recent_score.c.product_id)
    q = _exclude(q, exclude_ids)
    q = q.order_by(
        (func.coalesce(recent_score.c.score, 0.0) + Product.views * 0.01).desc(),
        Product.created_at.desc(),
    ).limit(limit)

    result = await db.execute(q)
    return [row[0] for row in result.all()]


# ── New arrivals ─────────────────────────────────────────────────────────

async def get_new_arrivals(
    db: AsyncSession, limit: int, exclude_ids: Optional[Iterable[uuid.UUID]] = None
) -> list[Product]:
    q = _active(select(Product))
    q = _exclude(q, exclude_ids)
    q = q.order_by(Product.created_at.desc()).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


# ── Random discovery ─────────────────────────────────────────────────────

async def get_random_products(
    db: AsyncSession, limit: int, exclude_ids: Optional[Iterable[uuid.UUID]] = None
) -> list[Product]:
    """
    Efficient randomized sampling for Postgres. Avoids `ORDER BY random()`
    over the whole table (full scan + sort, gets slower as the catalog
    grows) by using TABLESAMPLE SYSTEM to grab a random block of pages
    first, then falls back to a plain random order only for the (typically
    tiny) shortfall if the sample didn't yield enough rows.
    """
    if limit <= 0:
        return []

    exclude_set = set(exclude_ids or [])

    total_result = await db.execute(
        select(func.count()).select_from(_active(select(Product)).subquery())
    )
    total = total_result.scalar() or 0
    if total == 0:
        return []

    # Sample a generous percentage so we comfortably clear `limit` rows even
    # after filtering + exclusions; TABLESAMPLE SYSTEM reads whole pages so
    # small tables just get a bigger effective percentage.
    pct = min(100.0, max(5.0, (limit / max(total, 1)) * 500))

    try:
        sample = Product.__table__.tablesample(func.system(pct))
        raw = await db.execute(
            select(sample.c.id)
            .where(
                sample.c.is_active == True,  # noqa: E712
                sample.c.deleted_at.is_(None),
                sample.c.approval_status == "approved",
            )
            .limit(limit * 3)
        )
        candidate_ids = [row[0] for row in raw.all() if row[0] not in exclude_set]
    except Exception:
        # TABLESAMPLE isn't available on every backend (e.g. SQLite in tests)
        # — fall back gracefully rather than breaking the feed.
        logger.warning("TABLESAMPLE random query failed, falling back", exc_info=True)
        candidate_ids = []

    random.shuffle(candidate_ids)
    chosen_ids = candidate_ids[:limit]

    if len(chosen_ids) < limit:
        # Small catalog or unlucky sample — top up with a plain random query
        # for just the shortfall (cheap when the remainder is small).
        remaining = limit - len(chosen_ids)
        fallback_exclude = exclude_set | set(chosen_ids)
        q = _active(select(Product.id))
        q = _exclude(q, fallback_exclude)
        q = q.order_by(func.random()).limit(remaining)
        fallback = await db.execute(q)
        chosen_ids.extend(row[0] for row in fallback.all())

    if not chosen_ids:
        return []

    result = await db.execute(_active(select(Product)).where(Product.id.in_(chosen_ids)))
    products = list(result.scalars().all())
    random.shuffle(products)
    return products


# ── Personalized picks ─────────────────────────────────────────────────────

async def get_personalized_products(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int,
    exclude_ids: Optional[Iterable[uuid.UUID]] = None,
) -> list[Product]:
    if limit <= 0:
        return []

    category_scores = await get_user_category_scores(db, user_id)
    if not category_scores:
        return []

    top_categories = [c for c, _ in sorted(category_scores.items(), key=lambda kv: kv[1], reverse=True)[:5]]

    q = _active(select(Product)).where(Product.category.in_(top_categories))
    q = _exclude(q, exclude_ids)
    # Oversample and add a random jitter to the ordering so refreshing the
    # homepage doesn't show the exact same personalized set every time,
    # while still weighting toward the user's more-viewed categories.
    q = q.order_by((Product.views * 0.1 + func.random() * 20).desc()).limit(limit * 3)
    result = await db.execute(q)
    candidates = list(result.scalars().all())
    random.shuffle(candidates)
    return candidates[:limit]


# ── Hybrid feed assembly ─────────────────────────────────────────────────

async def build_feed(
    db: AsyncSession,
    user: Optional[User],
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Product], bool]:
    """
    Assembles the hybrid discovery feed:
      logged in  -> 50% personalized / 20% trending / 20% new / 10% random
      guest      -> 40% trending / 30% new / 30% random

    Each call recomputes with fresh randomness, so refreshing the page
    naturally rotates part of the feed without repeating the exact same
    order — while still keeping recommendations reasonably on-topic.
    """
    per_page = max(1, min(per_page, 50))
    page = max(1, page)
    pool_size = page * per_page  # build a pool deep enough to slice this page from

    seen_ids: set[uuid.UUID] = set()
    pool: list[Product] = []

    def _add(products: list[Product]):
        for p in products:
            if p.id not in seen_ids:
                seen_ids.add(p.id)
                pool.append(p)

    if user:
        n_personal = round(pool_size * 0.5)
        n_trending = round(pool_size * 0.2)
        n_new = round(pool_size * 0.2)
        n_random = max(0, pool_size - n_personal - n_trending - n_new)

        personalized = await get_personalized_products(db, user.id, n_personal, exclude_ids=seen_ids)
        _add(personalized)
    else:
        n_trending = round(pool_size * 0.4)
        n_new = round(pool_size * 0.3)
        n_random = max(0, pool_size - n_trending - n_new)

    trending = await get_trending_products(db, n_trending, exclude_ids=seen_ids)
    _add(trending)

    new_arrivals = await get_new_arrivals(db, n_new, exclude_ids=seen_ids)
    _add(new_arrivals)

    random_picks = await get_random_products(db, n_random, exclude_ids=seen_ids)
    _add(random_picks)

    # Backfill if the catalog is small enough that some buckets came up
    # short — top up with any remaining active products, newest first.
    if len(pool) < pool_size:
        backfill = await get_new_arrivals(db, pool_size - len(pool), exclude_ids=seen_ids)
        _add(backfill)

    # Light shuffle so the feed reads naturally (not four rigid blocks)
    # while still being seeded by the weighted buckets above.
    random.shuffle(pool)

    offset = (page - 1) * per_page
    page_items = pool[offset: offset + per_page]
    has_more = len(pool) > offset + per_page

    return page_items, has_more
