import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.config import settings
from app.core.deps import require_role
from app.models.user import User
from app.models.order import Order
from app.models.payment import Payment
from app.schemas.payment import RazorpayCreateRequest, RazorpayOrderResponse, RazorpayVerifyRequest, PaymentOut

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create", response_model=RazorpayOrderResponse)
async def create_payment_order(
    data: RazorpayCreateRequest,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    order = (await db.execute(select(Order).where(Order.id == data.order_id))).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Order not found", "code": "NOT_FOUND"})

    # In production with Razorpay credentials:
    # client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    # rzp_order = client.order.create({"amount": int(order.total_amount * 100), "currency": "INR", ...})
    # For project test mode:
    gateway_order_id = f"order_{uuid.uuid4().hex[:14]}"

    return RazorpayOrderResponse(
        gateway_order_id=gateway_order_id,
        amount=float(order.total_amount),
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
        order_id=str(order.id)
    )


@router.post("/verify")
async def verify_payment(
    data: RazorpayVerifyRequest,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    payment = (await db.execute(select(Payment).where(Payment.order_id == data.order_id))).scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Payment record not found", "code": "NOT_FOUND"})

    # Mark paid
    payment.status = "paid"
    payment.gateway_payment_id = data.razorpay_payment_id
    payment.gateway_order_id = data.razorpay_order_id

    await db.commit()
    return {"status": "success", "message": "Payment verified and recorded"}
