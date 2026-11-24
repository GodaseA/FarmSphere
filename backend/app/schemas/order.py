from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class OrderCreateRequest(BaseModel):
    fulfilment: str = Field("delivery", pattern="^(delivery|pickup)$")
    delivery_address: Optional[str] = None
    payment_method: str = Field("online", pattern="^(online|cod)$")


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(confirmed|shipped|delivered|rejected|cancelled)$")


class OrderItemOut(BaseModel):
    id: str
    listing_id: Optional[str] = None
    crop_name: str
    unit_price: float
    quantity_kg: float
    line_total: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: str
    order_no: str
    customer_id: str
    farmer_id: str
    fulfilment: str
    delivery_address: Optional[str] = None
    total_amount: float
    status: str
    placed_at: datetime
    updated_at: datetime
    delivered_at: Optional[datetime] = None
    items: List[OrderItemOut] = []
    farmer_name: Optional[str] = None
    customer_name: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    has_review: bool = False

    class Config:
        from_attributes = True
