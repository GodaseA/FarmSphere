from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.listing import ListingOut


class AddToCartRequest(BaseModel):
    listing_id: str
    quantity_kg: float = Field(..., gt=0)


class UpdateCartItemRequest(BaseModel):
    quantity_kg: float = Field(..., gt=0)


class CartItemOut(BaseModel):
    id: str
    listing_id: str
    quantity_kg: float
    listing: Optional[ListingOut] = None

    class Config:
        from_attributes = True


class CartOut(BaseModel):
    id: str
    customer_id: str
    items: List[CartItemOut] = []
    total_amount: float = 0.0

    class Config:
        from_attributes = True
