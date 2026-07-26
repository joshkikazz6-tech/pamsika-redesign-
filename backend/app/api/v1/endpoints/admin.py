"""
Admin-only endpoints — products CRUD, orders, users, audit logs, withdrawals.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.product import Product
from app.models.order import Order
from app.models.user import User
from app.models.affiliate import AffiliateWithdrawal, WithdrawalStatus
from app.models.audit import AuditLog
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, PaginatedProducts
from app.schemas.common import (
    OrderOut, AdminUserOut, AuditLogOut,
    AdminWithdrawalOut, WithdrawalReview,
)
from app.api.deps import get_current_admin, get_client_ip
from app.services.audit import log_action
from fastapi import Request

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Stats (dashboard overview) ────────────────────────────────────────────────

@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Return aggregate counts for the admin overview KPI cards."""
    total_products = (await db.execute(
        select(func.count()).select_from(Product).where(Product.deleted_at.is_(None))
    )).scalar()
    total_orders = (await db.execute(
        select(func.count()).select_from(Order).where(Order.deleted_at.is_(None))
    )).scalar()
    total_users = (await db.execute(
        select(func.count()).select_from(User).where(User.deleted_at.is_(None))
    )).scalar()
    pending_withdrawals = (await db.execute(
        select(func.count()).select_from(AffiliateWithdrawal)
        .where(AffiliateWithdrawal.status == "pending",
               AffiliateWithdrawal.deleted_at.is_(None))
    )).scalar()
    total_affiliates = (await db.execute(
        select(func.count()).select_from(User)
        .where(User.is_affiliate == True, User.deleted_at.is_(None))
    )).scalar()
    active_sellers = (await db.execute(
        select(func.count()).select_from(User)
        .where(User.is_seller == True, User.seller_status == "approved",
               User.deleted_at.is_(None))
    )).scalar()
    pending_seller_approvals = (await db.execute(
        select(func.count()).select_from(User)
        .where(User.seller_status == "pending", User.deleted_at.is_(None))
    )).scalar()
    pending_products = (await db.execute(
        select(func.count()).select_from(Product)
        .where(Product.approval_status == "pending", Product.deleted_at.is_(None))
    )).scalar()
    total_revenue = float((await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.status == "completed", Order.deleted_at.is_(None))
    )).scalar())
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "pending_withdrawals": pending_withdrawals,
        "total_affiliates": total_affiliates,
        "active_sellers": active_sellers,
        "pending_seller_approvals": pending_seller_approvals,
        "pending_products": pending_products,
        "total_revenue": total_revenue,
    }


# ── Affiliates list ───────────────────────────────────────────────────────────

@router.get("/affiliates")
async def list_affiliates(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all users who are registered affiliates (Dolos)."""
    result = await db.execute(
        select(User)
        .where(User.is_affiliate == True, User.deleted_at.is_(None))
        .order_by(User.created_at.desc())
    )
    users = result.scalars().all()

    # BUGFIX: User has no `affiliate_referrals` column — compute sub-affiliate
    # counts from `referred_by` instead of referencing a nonexistent attribute
    # (the old code threw AttributeError on every call to this endpoint).
    aff_ids = [u.affiliate_id for u in users if u.affiliate_id]
    referral_counts: dict = {}
    if aff_ids:
        from sqlalchemy import func as _func
        counts_result = await db.execute(
            select(User.referred_by, _func.count(User.id))
            .where(User.referred_by.in_(aff_ids), User.deleted_at.is_(None))
            .group_by(User.referred_by)
        )
        referral_counts = {row[0]: row[1] for row in counts_result.all()}

    return [
        {
            "id": str(u.id),
            "user_id": str(u.id),
            "affiliate_id": u.affiliate_id,
            "email": u.email,
            "name": u.full_name,
            "full_name": u.full_name,
            "clicks": u.affiliate_clicks,
            "sales": u.affiliate_sales,
            "referrals": referral_counts.get(u.affiliate_id, 0),
            "commission_balance": u.affiliate_commission_balance,
            "commission_override": u.affiliate_commission_override,
            "status": "active",
        }
        for u in users
    ]


# ── Products ──────────────────────────────────────────────────────────────────

@router.post("/products", response_model=ProductOut, status_code=201)
async def create_product(
    payload: ProductCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    product = Product(**payload.model_dump())
    db.add(product)
    await db.flush()
    await log_action(db, "create_product", user_id=admin.id, resource="product",
                     resource_id=str(product.id), ip_address=get_client_ip(request))
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    payload: ProductUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.deleted_at.is_(None))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    await db.flush()
    await log_action(db, "update_product", user_id=admin.id, resource="product",
                     resource_id=product_id, ip_address=get_client_ip(request))
    return product


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.deleted_at.is_(None))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.deleted_at = datetime.now(timezone.utc)
    product.is_active = False
    await db.flush()
    await log_action(db, "delete_product", user_id=admin.id, resource="product",
                     resource_id=product_id, ip_address=get_client_ip(request))
    return {"detail": "Product soft-deleted"}


# ── Orders ────────────────────────────────────────────────────────────────────

@router.delete("/orders/{order_id}")
async def admin_delete_order(
    order_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Soft-delete a single order from admin panel."""
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.deleted_at.is_(None))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.deleted_at = datetime.now(timezone.utc)
    await db.flush()
    await log_action(db, "delete_order", user_id=admin.id, resource="order",
                     resource_id=order_id, ip_address=get_client_ip(request))
    return {"detail": "Order deleted"}


@router.delete("/orders")
async def admin_clear_orders(
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Soft-delete ALL orders (clear order history) from admin panel."""
    result = await db.execute(
        select(Order).where(Order.deleted_at.is_(None))
    )
    orders = result.scalars().all()
    now = datetime.now(timezone.utc)
    for order in orders:
        order.deleted_at = now
    await db.flush()
    await log_action(db, "clear_all_orders", user_id=admin.id, resource="order",
                     ip_address=get_client_ip(request))
    return {"detail": f"Cleared {len(orders)} orders"}


@router.patch("/orders/{order_id}")
async def patch_order(
    order_id: str,
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from app.models.order import Order as OrderModel, OrderItem
    result = await db.execute(
        select(OrderModel).where(OrderModel.id == order_id, OrderModel.deleted_at.is_(None))
        .options(selectinload(OrderModel.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    old_status = order.status
    if "status" in payload:
        order.status = payload["status"]
        # REVERSAL: if cancelling a paid order, claw back credited commissions
        if payload["status"] == "cancelled" and old_status not in ("cancelled", "completed") and order.commissions_paid:
            order.commissions_paid = False  # reset so it could be re-credited if un-cancelled
            for item in order.items:
                if item.affiliate_id:
                    aff_result = await db.execute(
                        select(User).where(User.affiliate_id == item.affiliate_id, User.is_affiliate == True)
                    )
                    aff_user = aff_result.scalar_one_or_none()
                    if aff_user:
                        comm_pct = float(item.product_snapshot.get("commission_percent", 5)) / 100
                        commission = round(item.unit_price * item.quantity * comm_pct, 2)
                        is_self_referral = str(order.user_id) == str(aff_user.id)
                        sub_cut = 0.0
                        if not is_self_referral and aff_user.referred_by:
                            referrer_result = await db.execute(
                                select(User).where(
                                    User.affiliate_id == aff_user.referred_by,
                                    User.is_affiliate == True,
                                    User.deleted_at.is_(None),
                                )
                            )
                            referrer = referrer_result.scalar_one_or_none()
                            if referrer:
                                sub_cut = round(commission * 0.05, 2)
                                referrer.affiliate_commission_balance = max(
                                    0.0, round(referrer.affiliate_commission_balance - sub_cut, 2)
                                )
                                referrer.affiliate_sales = max(0, referrer.affiliate_sales - 1)
                        aff_user.affiliate_commission_balance = max(
                            0.0, round(aff_user.affiliate_commission_balance - (commission - sub_cut), 2)
                        )
                        aff_user.affiliate_sales = max(0, aff_user.affiliate_sales - 1)

        # Credit affiliate commissions only when marking as completed AND not already paid
        if payload["status"] == "completed" and old_status != "completed" and not order.commissions_paid:
            order.commissions_paid = True  # IDEMPOTENCY GUARD — set before crediting
            # Accumulate per-affiliate totals so affiliate_sales is incremented once per order, not per item
            aff_totals: dict = {}  # str(aff_user.id) -> {"user": User, "amount": float, "referrer": User|None}
            for item in order.items:
                if item.affiliate_id:
                    aff_result = await db.execute(
                        select(User).where(User.affiliate_id == item.affiliate_id, User.is_affiliate == True)
                    )
                    aff_user = aff_result.scalar_one_or_none()
                    if aff_user:
                        comm_pct = float(item.product_snapshot.get("commission_percent", 5)) / 100
                        commission = round(item.unit_price * item.quantity * comm_pct, 2)
                        aff_key = str(aff_user.id)
                        if aff_key not in aff_totals:
                            # Resolve referrer once per affiliate, not once per item
                            # NOTE: referrer always gets their 5% cut even on self-orders
                            referrer = None
                            is_self_referral = str(order.user_id) == str(aff_user.id)
                            if aff_user.referred_by:
                                referrer_result = await db.execute(
                                    select(User).where(
                                        User.affiliate_id == aff_user.referred_by,
                                        User.is_affiliate == True,
                                        User.deleted_at.is_(None),
                                    )
                                )
                                referrer = referrer_result.scalar_one_or_none()
                            aff_totals[aff_key] = {"user": aff_user, "amount": 0.0, "referrer": referrer, "is_self_referral": is_self_referral}
                        aff_totals[aff_key]["amount"] = round(aff_totals[aff_key]["amount"] + commission, 2)
            # Apply commissions — one affiliate_sales increment per affiliate per order (not per item)
            for aff_key, entry in aff_totals.items():
                aff_user = entry["user"]
                total_commission = entry["amount"]
                referrer = entry["referrer"]
                sub_cut = 0.0
                # Referrer (inviter) always gets 5% of the commission when their recruit earns
                if referrer:
                    sub_cut = round(total_commission * 0.05, 2)
                    referrer.affiliate_commission_balance = round(
                        referrer.affiliate_commission_balance + sub_cut, 2
                    )
                    referrer.affiliate_sales += 1  # once per order, not per item
                # Affiliate ALWAYS earns their own commission (including self-orders)
                aff_user.affiliate_commission_balance = round(
                    aff_user.affiliate_commission_balance + (total_commission - sub_cut), 2
                )
                aff_user.affiliate_sales += 1  # once per order, not per item

            # ── Credit seller earnings on completion ──────────────────────────
            if order.seller_id:
                seller_result = await db.execute(
                    select(User).where(User.id == order.seller_id, User.deleted_at.is_(None))
                )
                seller_user = seller_result.scalar_one_or_none()
                if seller_user:
                    # Sum item totals; platform keeps commission_percent, seller earns the rest
                    seller_gross = sum(
                        round(i.unit_price * i.quantity, 2) for i in order.items
                    )
                    # Use commission_percent from first item snapshot (all items same seller/product)
                    _cp = float(order.items[0].product_snapshot.get("commission_percent", 5.0)) / 100 if order.items else 0.05
                    seller_earnings = round(seller_gross * (1.0 - _cp), 2)
                    seller_user.seller_referral_bonus = round(
                        seller_user.seller_referral_bonus + seller_earnings, 2
                    )

        # Reverse commissions if cancelling an order that was already completed+paid
        elif payload["status"] == "cancelled" and old_status == "completed" and order.commissions_paid:
            order.commissions_paid = False  # allow re-credit if re-completed
            aff_totals_rev: dict = {}
            for item in order.items:
                if item.affiliate_id:
                    aff_result = await db.execute(
                        select(User).where(User.affiliate_id == item.affiliate_id, User.is_affiliate == True)
                    )
                    aff_user = aff_result.scalar_one_or_none()
                    if aff_user:
                        comm_pct = float(item.product_snapshot.get("commission_percent", 5)) / 100
                        commission = round(item.unit_price * item.quantity * comm_pct, 2)
                        aff_key = str(aff_user.id)
                        if aff_key not in aff_totals_rev:
                            referrer = None
                            is_self_referral = str(order.user_id) == str(aff_user.id)
                            if aff_user.referred_by:
                                referrer_result = await db.execute(
                                    select(User).where(
                                        User.affiliate_id == aff_user.referred_by,
                                        User.is_affiliate == True,
                                        User.deleted_at.is_(None),
                                    )
                                )
                                referrer = referrer_result.scalar_one_or_none()
                            aff_totals_rev[aff_key] = {"user": aff_user, "amount": 0.0, "referrer": referrer, "is_self_referral": is_self_referral}
                        aff_totals_rev[aff_key]["amount"] = round(aff_totals_rev[aff_key]["amount"] + commission, 2)
            for aff_key, entry in aff_totals_rev.items():
                aff_user = entry["user"]
                total_commission = entry["amount"]
                referrer = entry["referrer"]
                sub_cut = 0.0
                if referrer:
                    sub_cut = round(total_commission * 0.05, 2)
                    referrer.affiliate_commission_balance = max(
                        0.0, round(referrer.affiliate_commission_balance - sub_cut, 2)
                    )
                    referrer.affiliate_sales = max(0, referrer.affiliate_sales - 1)
                aff_user.affiliate_commission_balance = max(
                    0.0, round(aff_user.affiliate_commission_balance - (total_commission - sub_cut), 2)
                )
                aff_user.affiliate_sales = max(0, aff_user.affiliate_sales - 1)

            # ── Reverse seller earnings on cancellation of completed order ────
            if order.seller_id:
                seller_result = await db.execute(
                    select(User).where(User.id == order.seller_id, User.deleted_at.is_(None))
                )
                seller_user = seller_result.scalar_one_or_none()
                if seller_user:
                    seller_gross = sum(
                        round(i.unit_price * i.quantity, 2) for i in order.items
                    )
                    _cp = float(order.items[0].product_snapshot.get("commission_percent", 5.0)) / 100 if order.items else 0.05
                    seller_earnings = round(seller_gross * (1.0 - _cp), 2)
                    seller_user.seller_referral_bonus = max(
                        0.0, round(seller_user.seller_referral_bonus - seller_earnings, 2)
                    )

    await db.flush()
    await log_action(db, "update_order", user_id=admin.id, resource="order",
                     resource_id=order_id, ip_address=get_client_ip(request))
    return {"detail": "Order updated", "status": order.status, "id": str(order.id)}


@router.get("/orders")
async def list_all_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(Order)
        .where(Order.deleted_at.is_(None))
        .options(selectinload(Order.items), selectinload(Order.user))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    orders = result.scalars().all()
    # Serialize manually to avoid lazy-load issues and include user email
    return [
        {
            "id": str(o.id),
            "user_id": str(o.user_id) if o.user_id else None,
            "customer_email": o.user.email if o.user else None,
            "customer_name": o.user.full_name if o.user else (o.contact_info or {}).get("name", "Guest"),
            "total_amount": o.total_amount,
            "payment_method": o.payment_method,
            "status": o.status,
            "contact_info": o.contact_info,
            "created_at": o.created_at.isoformat(),
            "items": [
                {
                    "id": str(i.id),
                    "product_id": str(i.product_id) if i.product_id else None,
                    "product_snapshot": i.product_snapshot,
                    "quantity": i.quantity,
                    "unit_price": i.unit_price,
                    "affiliate_id": i.affiliate_id,
                }
                for i in (o.items or [])
            ],
        }
        for o in orders
    ]


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from app.models.order import Order as OrderModel
    from sqlalchemy import func as sqlfunc

    result = await db.execute(
        select(User)
        .where(User.deleted_at.is_(None))
        .order_by(User.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    users = result.scalars().all()

    # Compute per-user order count + spend in one query
    stats_result = await db.execute(
        select(
            OrderModel.user_id,
            sqlfunc.count(OrderModel.id).label("order_count"),
            sqlfunc.coalesce(sqlfunc.sum(OrderModel.total_amount), 0).label("total_spent"),
        )
        .where(OrderModel.deleted_at.is_(None))
        .group_by(OrderModel.user_id)
    )
    stats_map = {
        str(row.user_id): {"orders": row.order_count, "spent": float(row.total_spent)}
        for row in stats_result.all()
    }

    def _derive_role(u: User) -> str:
        if u.is_admin:
            return "admin"
        if u.is_seller and u.seller_status == "approved":
            return "seller"
        if u.is_affiliate:
            return "affiliate"
        return "user"

    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "is_affiliate": u.is_affiliate,
            "affiliate_id": u.affiliate_id,
            "is_seller": u.is_seller,
            "seller_status": u.seller_status,
            "created_at": u.created_at.isoformat(),
            "last_login_ip": u.last_login_ip,
            "role": _derive_role(u),
            "orders": stats_map.get(str(u.id), {}).get("orders", 0),
            "spent": stats_map.get(str(u.id), {}).get("spent", 0.0),
            "joined": u.created_at.strftime("%Y-%m-%d"),
        }
        for u in users
    ]


# ── Audit Logs ────────────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=list[AuditLogOut])
async def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    return result.scalars().all()


# ── Withdrawals ───────────────────────────────────────────────────────────────

@router.get("/withdrawals")
async def list_withdrawals(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from app.core.encryption import decrypt_data

    q = select(AffiliateWithdrawal).where(AffiliateWithdrawal.deleted_at.is_(None))
    if status:
        q = q.where(AffiliateWithdrawal.status == str(status))
    result = await db.execute(q.order_by(AffiliateWithdrawal.created_at.desc()))
    withdrawals = result.scalars().all()

    # Build enriched response — decrypt payout details and fetch affiliate email
    out = []
    for w in withdrawals:
        # Decrypt payout details
        payout = {}
        try:
            decrypted = decrypt_data(w.encrypted_payout_details)
            import ast as _ast
            payout = _ast.literal_eval(decrypted)
            if not isinstance(payout, dict):
                payout = {"raw": decrypted}
        except Exception:
            payout = {}

        # Fetch affiliate email
        user_result = await db.execute(
            select(User.email).where(User.id == w.user_id)
        )
        email = user_result.scalar_one_or_none() or ""

        out.append({
            "id": str(w.id),
            "user_id": str(w.user_id),
            "affiliate_email": email,
            "amount": w.amount,
            "method": w.method,
            "payout_details": payout,
            "status": w.status,
            "admin_note": w.admin_note,
            "created_at": w.created_at.isoformat(),
            "reviewed_at": w.reviewed_at.isoformat() if w.reviewed_at else None,
        })
    return out


@router.patch("/withdrawals/{withdrawal_id}")
async def patch_withdrawal(
    withdrawal_id: str,
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Quick PATCH — set status to approved or rejected via {\"status\": \"approved\"}."""
    result = await db.execute(
        select(AffiliateWithdrawal).where(
            AffiliateWithdrawal.id == withdrawal_id,
            AffiliateWithdrawal.deleted_at.is_(None),
        )
    )
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    new_status = payload.get("status", "")
    if new_status == "approved":
        w.status = WithdrawalStatus.approved
    elif new_status == "rejected":
        # Refund balance on rejection — route to correct wallet by withdrawal_type
        user_result = await db.execute(select(User).where(User.id == w.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            if getattr(w, "withdrawal_type", "affiliate") == "seller_payout":
                user.seller_referral_bonus = round(user.seller_referral_bonus + w.amount, 2)
            else:
                user.affiliate_commission_balance = round(
                    user.affiliate_commission_balance + w.amount, 2
                )
        w.status = WithdrawalStatus.rejected
    else:
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'")

    w.reviewed_by = admin.id
    from datetime import datetime, timezone
    w.reviewed_at = datetime.now(timezone.utc)
    await db.flush()
    await log_action(db, f"{new_status}_withdrawal", user_id=admin.id,
                     resource="withdrawal", resource_id=withdrawal_id,
                     ip_address=get_client_ip(request))
    return {"detail": f"Withdrawal {new_status}"}



@router.put("/withdrawals/{withdrawal_id}/approve")
async def approve_withdrawal(
    withdrawal_id: str,
    payload: WithdrawalReview,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(AffiliateWithdrawal).where(
            AffiliateWithdrawal.id == withdrawal_id,
            AffiliateWithdrawal.status == "pending",
        )
    )
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Withdrawal not found or not pending")

    w.status = WithdrawalStatus.approved
    w.reviewed_by = admin.id
    w.reviewed_at = datetime.now(timezone.utc)
    w.admin_note = payload.note
    await db.flush()
    await log_action(db, "approve_withdrawal", user_id=admin.id, resource="withdrawal",
                     resource_id=withdrawal_id, ip_address=get_client_ip(request))
    return {"detail": "Withdrawal approved"}


@router.put("/withdrawals/{withdrawal_id}/reject")
async def reject_withdrawal(
    withdrawal_id: str,
    payload: WithdrawalReview,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(AffiliateWithdrawal).where(
            AffiliateWithdrawal.id == withdrawal_id,
            AffiliateWithdrawal.status == "pending",
        )
    )
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Withdrawal not found or not pending")

    # Refund balance — route to correct wallet by withdrawal_type
    user_result = await db.execute(select(User).where(User.id == w.user_id))
    user = user_result.scalar_one_or_none()
    if user:
        if getattr(w, "withdrawal_type", "affiliate") == "seller_payout":
            user.seller_referral_bonus = round(user.seller_referral_bonus + w.amount, 2)
        else:
            user.affiliate_commission_balance = round(
                user.affiliate_commission_balance + w.amount, 2
            )

    w.status = WithdrawalStatus.rejected
    w.reviewed_by = admin.id
    w.reviewed_at = datetime.now(timezone.utc)
    w.admin_note = payload.note
    await db.flush()
    await log_action(db, "reject_withdrawal", user_id=admin.id, resource="withdrawal",
                     resource_id=withdrawal_id, ip_address=get_client_ip(request))
    return {"detail": "Withdrawal rejected"}

# ── Seller Management ─────────────────────────────────────────────────────────

@router.get("/sellers")
async def list_sellers(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List all users who have applied to or are approved as sellers."""
    q = select(User).where(
        User.seller_status.isnot(None),
        User.deleted_at.is_(None),
    )
    if status:
        q = q.where(User.seller_status == status)
    result = await db.execute(
        q.order_by(User.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    sellers = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "is_seller": u.is_seller,
            "seller_status": u.seller_status,
            "seller_business": u.seller_business,
            "seller_phone": u.seller_phone,
            "seller_location": u.seller_location,
            "seller_nid": u.seller_nid,
            "seller_description": u.seller_description,
            "seller_referral_bonus": u.seller_referral_bonus,
            "created_at": u.created_at.isoformat(),
        }
        for u in sellers
    ]


@router.patch("/sellers/{user_id}")
async def patch_seller_status(
    user_id: str,
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Approve, reject, or suspend a seller application."""
    result = await db.execute(
        select(User).where(User.id == user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_status = payload.get("seller_status", "")
    if new_status == "approved":
        user.is_seller = True
        user.seller_status = "approved"
    elif new_status == "rejected":
        user.is_seller = False
        user.seller_status = "rejected"
    elif new_status == "pending":
        # Suspend — reverts dashboard access
        user.seller_status = "pending"
    else:
        raise HTTPException(
            status_code=400,
            detail="seller_status must be: approved, rejected, or pending",
        )

    await db.flush()
    await log_action(
        db, f"admin_seller_{new_status}",
        user_id=admin.id, resource="user", resource_id=user_id,
        ip_address=get_client_ip(request),
    )
    return {"detail": f"Seller {new_status}", "seller_status": user.seller_status}


# ── Seller Product Approvals ──────────────────────────────────────────────────

@router.get("/seller-products")
async def list_seller_products(
    approval_status: Optional[str] = Query("pending"),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """List seller-submitted products by approval status for admin review."""
    q = select(Product).where(
        Product.seller_id.isnot(None),
        Product.deleted_at.is_(None),
    )
    if approval_status:
        q = q.where(Product.approval_status == approval_status)
    result = await db.execute(
        q.order_by(Product.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    products = result.scalars().all()

    # Fetch seller info for each product in one query
    seller_ids = list({p.seller_id for p in products if p.seller_id})
    sellers_map: dict = {}
    if seller_ids:
        sellers_result = await db.execute(
            select(User).where(User.id.in_(seller_ids))
        )
        for s in sellers_result.scalars().all():
            sellers_map[str(s.id)] = {
                "full_name": s.full_name,
                "email": s.email,
                "seller_business": s.seller_business or "",
            }

    return [
        {
            "id": str(p.id),
            "name": p.name,
            "category": p.category,
            "price": p.price,
            "seller_price": p.seller_price,
            "stock": p.stock,
            "location": p.location,
            "description": p.description,
            "images": p.images,
            "approval_status": p.approval_status,
            "reject_reason": p.reject_reason,
            "commission_percent": p.commission_percent,
            "affiliate_commission_percent": p.affiliate_commission_percent,
            "created_at": p.created_at.isoformat(),
            "seller_id": str(p.seller_id),
            "seller": sellers_map.get(str(p.seller_id), {}),
        }
        for p in products
    ]


@router.patch("/seller-products/{product_id}")
async def patch_seller_product_approval(
    product_id: str,
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Approve or reject a seller-submitted product.
    Approval: sets commission_percent, makes product live.
    Rejection: stores reject_reason, keeps product inactive.
    """
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.seller_id.isnot(None),
            Product.deleted_at.is_(None),
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Seller product not found")

    action = payload.get("approval_status", "")
    if action == "approved":
        platform_commission = float(payload.get("platform_commission_percent", 10.0))
        affiliate_commission = float(payload.get("affiliate_commission_percent", 5.0))

        if not (0.0 <= platform_commission <= 100.0):
            raise HTTPException(status_code=400, detail="platform_commission_percent must be 0–100")
        if not (0.0 <= affiliate_commission <= 100.0):
            raise HTTPException(status_code=400, detail="affiliate_commission_percent must be 0–100")

        # Compute marketplace price: seller_price + platform markup
        base = float(product.seller_price or product.price)
        marketplace_price = round(base * (1.0 + platform_commission / 100.0), 2)

        product.approval_status = "approved"
        product.price = marketplace_price                        # Price shown in marketplace
        product.seller_price = base                             # Original seller price preserved
        product.commission_percent = affiliate_commission       # % affiliates earn
        product.affiliate_commission_percent = affiliate_commission
        product.is_active = True
        product.reject_reason = None
    elif action == "rejected":
        reason = (
            payload.get("reject_reason") or "Does not meet Pa_mSikA listing standards"
        ).strip()
        product.approval_status = "rejected"
        product.reject_reason = reason[:500]
        product.is_active = False
    else:
        raise HTTPException(
            status_code=400,
            detail="approval_status must be 'approved' or 'rejected'",
        )

    await db.flush()
    await log_action(
        db, f"admin_product_{action}",
        user_id=admin.id, resource="product", resource_id=product_id,
        ip_address=get_client_ip(request),
    )
    return {
        "detail": f"Product {action}",
        "approval_status": product.approval_status,
        "price": product.price,
        "seller_price": product.seller_price,
        "platform_commission_percent": round((product.price - (product.seller_price or product.price)) / max(product.seller_price or 1, 1) * 100, 2) if action == "approved" else None,
        "affiliate_commission_percent": product.affiliate_commission_percent,
        "commission_percent": product.commission_percent,
    }


# ── Affiliate Commission Management ──────────────────────────────────────────

@router.post("/affiliates/set-global-commission")
async def set_global_affiliate_commission(
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Bulk-set commission_percent on ALL non-seller Pa_mSikA products.
    Does NOT touch seller products (those have their own rates set at approval).
    """
    rate = float(payload.get("commission_percent", 5.0))
    if not (0.0 <= rate <= 100.0):
        raise HTTPException(status_code=400, detail="commission_percent must be 0–100")

    result = await db.execute(
        select(Product).where(
            Product.seller_id.is_(None),       # Only Pa_mSikA own products
            Product.deleted_at.is_(None),
        )
    )
    products = result.scalars().all()
    for p in products:
        p.commission_percent = rate
        p.affiliate_commission_percent = rate

    await db.flush()
    await log_action(
        db, "set_global_affiliate_commission",
        user_id=admin.id,
        ip_address=get_client_ip(request),
        metadata={"rate": rate, "products_updated": len(products)},
    )
    return {
        "detail": f"Commission updated to {rate}% on {len(products)} Pa_mSikA products",
        "commission_percent": rate,
        "products_updated": len(products),
    }


@router.patch("/affiliates/{user_id}/commission")
async def set_affiliate_commission_override(
    user_id: str,
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Set a custom commission override for a specific affiliate.
    When set, this rate is used instead of product.commission_percent for this affiliate.
    Pass commission_percent: null to clear the override (revert to product rate).
    """
    result = await db.execute(
        select(User).where(User.id == user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_affiliate:
        raise HTTPException(status_code=400, detail="User is not an affiliate")

    raw = payload.get("commission_percent")
    if raw is None:
        user.affiliate_commission_override = None
        label = "cleared (will use product default)"
    else:
        rate = float(raw)
        if not (0.0 <= rate <= 100.0):
            raise HTTPException(status_code=400, detail="commission_percent must be 0–100")
        user.affiliate_commission_override = rate
        label = f"set to {rate}%"

    await db.flush()
    await log_action(
        db, "set_affiliate_commission_override",
        user_id=admin.id,
        resource="user", resource_id=user_id,
        ip_address=get_client_ip(request),
        metadata={"override": user.affiliate_commission_override},
    )
    return {
        "detail": f"Commission override {label} for {user.full_name}",
        "affiliate_id": user.affiliate_id,
        "commission_override": user.affiliate_commission_override,
    }