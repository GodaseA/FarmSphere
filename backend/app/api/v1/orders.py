from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.core.deps import require_role, get_current_user
from app.models.user import User
from app.models.dispute import Dispute
from app.models.order import Order
from app.schemas.order import OrderCreateRequest, OrderOut
from app.schemas.review import ReviewCreateRequest, ReviewOut
from app.schemas.dispute import DisputeCreateRequest, DisputeOut
from app.services.order_service import checkout_cart_to_orders, get_customer_orders, get_order_by_id
from app.services.review_service import create_order_review

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=List[OrderOut])
async def place_order_from_cart(
    data: OrderCreateRequest,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await checkout_cart_to_orders(db, str(current_user.id), data)


@router.get("", response_model=List[OrderOut])
async def my_orders(
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_customer_orders(db, str(current_user.id))


@router.get("/{id}", response_model=OrderOut)
async def single_order(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order = await get_order_by_id(db, id)
    # RBAC check: only owner customer, assigned farmer, or admin can view
    if current_user.role != "admin" and order.customer_id != str(current_user.id) and order.farmer_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={"detail": "Unauthorized access to order", "code": "FORBIDDEN"})
    return order


@router.post("/{id}/review", response_model=ReviewOut)
async def submit_review(
    id: str,
    data: ReviewCreateRequest,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await create_order_review(db, str(current_user.id), id, data)


@router.post("/{id}/dispute")
async def raise_dispute(
    id: str,
    data: DisputeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order = (await db.execute(select(Order).where(Order.id == id))).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Order not found", "code": "NOT_FOUND"})

    dispute = Dispute(
        order_id=order.id,
        raised_by=current_user.id,
        reason=data.reason,
        status="open"
    )
    db.add(dispute)
    await db.commit()
    await db.refresh(dispute)
    return {"status": "success", "message": "Dispute lodged with administration", "dispute_id": str(dispute.id)}
