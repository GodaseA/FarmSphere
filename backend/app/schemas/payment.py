from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RazorpayCreateRequest(BaseModel):
    order_id: str


class RazorpayOrderResponse(BaseModel):
    gateway_order_id: str
    amount: float
    currency: str = "INR"
    key_id: str
    order_id: str


class RazorpayVerifyRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    id: str
    order_id: str
    method: str
    status: str
    amount: float
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
