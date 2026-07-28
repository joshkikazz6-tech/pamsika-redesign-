"""
Promo codes — admin creates, users apply at checkout.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user, get_current_admin
from app.db.base import Base
from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

router = APIRouter(prefix="/promo", tags=["promo"])


class PromoCode(Base):
    __tablename__ = "promo_codes"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(String(120), nullable=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    discount_type: Mapped[str] = mapped_column(String(20), default="percentage", nullable=False)  # "percentage" | "fixed"
    discount_percent: Mapped[float] = mapped_column(Float, nullable=False)
    min_spend: Mapped[float] = mapped_column(Float, default=0)
    applicable_category: Mapped[str | None] = mapped_column(String(64), nullable=True)
    max_uses: Mapped[int] = mapped_column(Integer, default=0)  # 0 = unlimited
    uses: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


def _serialize_promo(p: "PromoCode") -> dict:
    return {
        "id": str(p.id),
        "code": p.code,
        "title": p.title,
        "description": p.description,
        "discount_type": p.discount_type,
        "discount_percent": p.discount_percent,
        "min_spend": p.min_spend,
        "applicable_category": p.applicable_category,
        "uses": p.uses,
        "max_uses": p.max_uses,
        "is_active": p.is_active,
        "expires_at": p.expires_at.isoformat() if p.expires_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/validate/{code}")
async def validate_promo(code: str, subtotal: float = 0, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PromoCode).where(
            PromoCode.code == code.upper().strip(),
            PromoCode.is_active == True,
        )
    )
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid promo code")
    if promo.expires_at and datetime.now(timezone.utc) > promo.expires_at:
        raise HTTPException(status_code=400, detail="Promo code has expired")
    if promo.max_uses > 0 and promo.uses >= promo.max_uses:
        raise HTTPException(status_code=400, detail="Promo code has reached its usage limit")
    if promo.min_spend and subtotal and subtotal < promo.min_spend:
        raise HTTPException(status_code=400, detail=f"Minimum spend of {promo.min_spend} required")

    if promo.discount_type == "fixed":
        discount_amount = min(promo.discount_percent, subtotal) if subtotal else promo.discount_percent
    else:
        discount_amount = round((subtotal or 0) * (promo.discount_percent / 100), 2)

    return {
        "code": promo.code,
        "discount_type": promo.discount_type,
        "discount_percent": promo.discount_percent,
        "discount_amount": discount_amount,
        "applicable_category": promo.applicable_category,
        "valid": True,
    }


@router.post("/admin/create")
async def create_promo(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    code = (payload.get("code") or "").upper().strip()
    discount_type = payload.get("discount_type", "percentage")
    discount = float(payload.get("discount_percent", 0))
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    if discount_type == "percentage" and not 1 <= discount <= 100:
        raise HTTPException(status_code=400, detail="Percentage discount must be between 1 and 100")
    if discount_type == "fixed" and discount <= 0:
        raise HTTPException(status_code=400, detail="Fixed discount must be greater than 0")
    existing = await db.execute(select(PromoCode).where(PromoCode.code == code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Code already exists")
    promo = PromoCode(
        code=code,
        title=payload.get("title"),
        description=payload.get("description"),
        discount_type=discount_type,
        discount_percent=discount,
        min_spend=float(payload.get("min_spend", 0) or 0),
        applicable_category=payload.get("applicable_category"),
        max_uses=int(payload.get("max_uses", 0) or 0),
        expires_at=payload.get("expires_at"),
    )
    db.add(promo)
    await db.flush()
    return {"detail": "Promo code created", "code": code, "id": str(promo.id)}


@router.get("/admin/list")
async def list_promos(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(PromoCode).order_by(PromoCode.created_at.desc()))
    promos = result.scalars().all()
    return [_serialize_promo(p) for p in promos]


@router.patch("/admin/{promo_id}")
async def update_promo(
    promo_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(PromoCode).where(PromoCode.id == promo_id))
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")

    if "is_active" in payload:
        promo.is_active = bool(payload["is_active"])
    if "title" in payload:
        promo.title = payload["title"]
    if "description" in payload:
        promo.description = payload["description"]
    if "discount_type" in payload:
        promo.discount_type = payload["discount_type"]
    if "discount_percent" in payload:
        promo.discount_percent = float(payload["discount_percent"])
    if "min_spend" in payload:
        promo.min_spend = float(payload["min_spend"] or 0)
    if "applicable_category" in payload:
        promo.applicable_category = payload["applicable_category"]
    if "max_uses" in payload:
        promo.max_uses = int(payload["max_uses"] or 0)
    if "expires_at" in payload:
        promo.expires_at = payload["expires_at"]

    await db.flush()
    return _serialize_promo(promo)


@router.delete("/admin/{promo_id}")
async def delete_promo(promo_id: str, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(PromoCode).where(PromoCode.id == promo_id))
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")
    await db.delete(promo)
    await db.flush()
    return {"detail": "Deleted"}


async def _get_active_promo(db: AsyncSession, code: str) -> "PromoCode | None":
    """Used by orders.py to re-validate + apply a promo server-side at checkout."""
    result = await db.execute(
        select(PromoCode).where(PromoCode.code == code.upper().strip(), PromoCode.is_active == True)
    )
    return result.scalar_one_or_none()
