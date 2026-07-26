"""
Seller endpoints — application flow, seller dashboard, product submission,
seller orders, and payout requests (reusing AffiliateWithdrawal).
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.api.deps import get_current_user, get_client_ip
from app.services.audit import log_action

router = APIRouter(prefix="/seller", tags=["seller"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _require_approved_seller(current_user: User) -> None:
    """Raise 403 if the user is not an approved seller."""
    if not current_user.is_seller or current_user.seller_status != "approved":
        raise HTTPException(
            status_code=403,
            detail="Approved seller account required",
        )


# ── Application ───────────────────────────────────────────────────────────────

@router.post("/apply", status_code=201)
async def apply_seller(
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a seller application.
    Idempotent: re-submitting while pending updates the stored details.
    Returns 200-style dict even on 201 so the frontend can read the status.
    """
    if current_user.is_seller and current_user.seller_status == "approved":
        return {"detail": "Already an approved seller", "seller_status": "approved"}

    business = (payload.get("business") or "").strip()
    phone    = (payload.get("phone") or "").strip()
    location = (payload.get("location") or "").strip()
    nid      = (payload.get("nid") or "").strip()
    desc     = (payload.get("description") or "").strip()

    if not all([business, phone, location, nid, desc]):
        raise HTTPException(
            status_code=400,
            detail="All fields are required: business, phone, location, nid, description",
        )

    current_user.seller_business    = business[:255]
    current_user.seller_phone       = phone[:50]
    current_user.seller_location    = location[:100]
    current_user.seller_nid         = nid[:100]
    current_user.seller_description = desc
    current_user.seller_status      = "pending"

    await db.flush()
    await log_action(
        db, "seller_apply",
        user_id=current_user.id,
        ip_address=get_client_ip(request),
    )
    return {"detail": "Application submitted", "seller_status": "pending"}


@router.delete("/apply")
async def withdraw_seller_application(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Withdraw a pending seller application."""
    if current_user.seller_status != "pending":
        raise HTTPException(status_code=400, detail="No pending application to withdraw")
    current_user.seller_status = None
    await db.flush()
    return {"detail": "Application withdrawn"}


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard")
async def seller_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return KPI stats, product list, and recent orders for the seller's dashboard."""
    _require_approved_seller(current_user)

    products_result = await db.execute(
        select(Product).where(
            Product.seller_id == current_user.id,
            Product.deleted_at.is_(None),
        ).order_by(Product.created_at.desc())
    )
    products = products_result.scalars().all()

    orders_result = await db.execute(
        select(Order)
        .where(Order.seller_id == current_user.id, Order.deleted_at.is_(None))
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    orders = orders_result.scalars().all()

    total_revenue = sum(
        o.total_amount for o in orders if o.status == "completed"
    )
    total_views = sum(p.views for p in products)

    return {
        "seller_id": str(current_user.id),
        "name": current_user.full_name,
        "business": current_user.seller_business or "",
        "email": current_user.email,
        "phone": current_user.seller_phone or "",
        "location": current_user.seller_location or "",
        "seller_referral_bonus": current_user.seller_referral_bonus,
        "products_count": len(products),
        "active_products": sum(
            1 for p in products if p.approval_status == "approved" and p.is_active
        ),
        "pending_products": sum(1 for p in products if p.approval_status == "pending"),
        "rejected_products": sum(1 for p in products if p.approval_status == "rejected"),
        "orders_count": len(orders),
        "pending_orders": sum(1 for o in orders if o.status == "pending"),
        "completed_orders": sum(1 for o in orders if o.status == "completed"),
        "total_revenue": total_revenue,
        "total_views": total_views,
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "category": p.category,
                "subcategory": p.subcategory,
                "price": p.price,
                "stock": p.stock,
                "location": p.location,
                "images": p.images,
                "approval_status": p.approval_status,
                "reject_reason": p.reject_reason,
                "commission_percent": p.commission_percent,
                "views": p.views,
                "is_active": p.is_active,
                "created_at": p.created_at.isoformat(),
            }
            for p in products
        ],
        "recent_orders": [
            {
                "id": str(o.id),
                "total_amount": o.total_amount,
                "status": o.status,
                "payment_method": o.payment_method,
                "created_at": o.created_at.isoformat(),
                "items": [
                    {
                        "product_name": i.product_snapshot.get("name", ""),
                        "quantity": i.quantity,
                        "unit_price": i.unit_price,
                    }
                    for i in o.items
                ],
            }
            for o in orders[:10]
        ],
    }


# ── Products ──────────────────────────────────────────────────────────────────

@router.get("/products")
async def seller_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all products submitted by the current seller."""
    _require_approved_seller(current_user)

    result = await db.execute(
        select(Product).where(
            Product.seller_id == current_user.id,
            Product.deleted_at.is_(None),
        ).order_by(Product.created_at.desc())
    )
    products = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "category": p.category,
            "subcategory": p.subcategory,
            "price": p.price,
            "stock": p.stock,
            "location": p.location,
            "images": p.images,
            "approval_status": p.approval_status,
            "reject_reason": p.reject_reason,
            "commission_percent": p.commission_percent,
            "views": p.views,
            "is_active": p.is_active,
            "created_at": p.created_at.isoformat(),
        }
        for p in products
    ]


@router.post("/products", status_code=201)
async def seller_submit_product(
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a new product for admin approval. Goes live only after admin approves."""
    _require_approved_seller(current_user)

    name     = (payload.get("name") or "").strip()
    category = (payload.get("category") or "").strip()
    desc     = (payload.get("description") or "").strip()

    try:
        price = float(payload.get("price") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="price must be a number")
    try:
        stock = int(payload.get("stock") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="stock must be an integer")

    if not name:
        raise HTTPException(status_code=400, detail="name is required")
    if not category:
        raise HTTPException(status_code=400, detail="category is required")
    if price <= 0:
        raise HTTPException(status_code=400, detail="price must be positive")
    if stock < 0:
        raise HTTPException(status_code=400, detail="stock cannot be negative")

    product = Product(
        name=name,
        description=desc,
        price=price,                   # Will be updated to seller_price + platform markup on approval
        seller_price=price,            # Original price seller submitted — preserved forever
        category=category,
        subcategory=payload.get("subcategory"),
        location=(payload.get("location") or current_user.seller_location),
        images=payload.get("images") or [],
        commission_percent=0.0,              # Admin sets affiliate commission on approval
        affiliate_commission_percent=0.0,    # Admin sets this on approval
        stock=stock,
        is_active=False,                     # Not visible until admin approves
        approval_status="pending",
        seller_id=current_user.id,
    )
    db.add(product)
    await db.flush()
    await log_action(
        db, "seller_submit_product",
        user_id=current_user.id,
        resource="product",
        resource_id=str(product.id),
        ip_address=get_client_ip(request),
    )
    return {
        "id": str(product.id),
        "name": product.name,
        "approval_status": product.approval_status,
        "detail": "Product submitted for approval",
    }


@router.delete("/products/{product_id}")
async def seller_delete_product(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Seller soft-deletes their own product.
    Blocked while the product is awaiting admin review (pending).
    """
    _require_approved_seller(current_user)

    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.seller_id == current_user.id,
            Product.deleted_at.is_(None),
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.approval_status == "pending":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a product currently awaiting admin review",
        )

    product.deleted_at = datetime.now(timezone.utc)
    product.is_active = False
    await db.flush()
    await log_action(
        db, "seller_delete_product",
        user_id=current_user.id,
        resource="product",
        resource_id=product_id,
        ip_address=get_client_ip(request),
    )
    return {"detail": "Product deleted"}


# ── Orders ────────────────────────────────────────────────────────────────────

@router.get("/orders")
async def seller_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all orders that contain this seller's products."""
    _require_approved_seller(current_user)

    result = await db.execute(
        select(Order)
        .where(Order.seller_id == current_user.id, Order.deleted_at.is_(None))
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    orders = result.scalars().all()
    return [
        {
            "id": str(o.id),
            "total_amount": o.total_amount,
            "status": o.status,
            "payment_method": o.payment_method,
            "created_at": o.created_at.isoformat(),
            "items": [
                {
                    "product_name": i.product_snapshot.get("name", ""),
                    "quantity": i.quantity,
                    "unit_price": i.unit_price,
                }
                for i in o.items
            ],
        }
        for o in orders
    ]


# ── Payout request ────────────────────────────────────────────────────────────

@router.post("/payout", status_code=201)
async def request_seller_payout(
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Seller requests payout of their accumulated seller_referral_bonus balance.
    Reuses AffiliateWithdrawal with withdrawal_type='seller_payout' (rule 7).
    """
    from app.models.affiliate import AffiliateWithdrawal
    from app.core.encryption import encrypt_data

    _require_approved_seller(current_user)

    try:
        amount = float(payload.get("amount") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="amount must be a number")

    method  = (payload.get("method") or "").strip()
    details = payload.get("details") or {}

    if amount < 2000:
        raise HTTPException(status_code=400, detail="Minimum payout is MWK 2,000")
    if amount > current_user.seller_referral_bonus:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Available: {current_user.seller_referral_bonus:.2f}",
        )
    if not method:
        raise HTTPException(status_code=400, detail="method is required")

    encrypted = encrypt_data(str(details))
    withdrawal = AffiliateWithdrawal(
        user_id=current_user.id,
        amount=amount,
        method=method,
        encrypted_payout_details=encrypted,
        withdrawal_type="seller_payout",
    )
    db.add(withdrawal)

    # Deduct from balance immediately; reversal happens on admin rejection
    current_user.seller_referral_bonus -= amount
    await db.flush()

    await log_action(
        db, "seller_payout_request",
        user_id=current_user.id,
        resource="withdrawal",
        resource_id=str(withdrawal.id),
        ip_address=get_client_ip(request),
        metadata={"amount": amount, "method": method},
    )
    return {
        "id": str(withdrawal.id),
        "amount": amount,
        "method": method,
        "status": "pending",
        "withdrawal_type": "seller_payout",
        "detail": "Payout request submitted",
    }