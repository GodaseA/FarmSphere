from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: str
    order_id: str
    customer_id: str
    farmer_id: str
    rating: int
    comment: Optional[str] = None
    is_hidden: bool
    created_at: datetime
    customer_name: Optional[str] = None
    crop_name: Optional[str] = None

    class Config:
        from_attributes = True
