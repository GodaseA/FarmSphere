from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class ListingCreate(BaseModel):
    crop_name: str
    description: Optional[str] = None
    price_per_kg: float = Field(..., gt=0)
    quantity_available_kg: float = Field(..., ge=0)
    min_order_kg: float = Field(1.0, gt=0)
    quality_grade: str = Field("A", pattern="^[ABC]$")
    is_organic: bool = False
    crop_yield_id: Optional[str] = None
    image_urls: List[str] = []


class ListingUpdate(BaseModel):
    crop_name: Optional[str] = None
    description: Optional[str] = None
    price_per_kg: Optional[float] = Field(None, gt=0)
    quantity_available_kg: Optional[float] = Field(None, ge=0)
    min_order_kg: Optional[float] = Field(None, gt=0)
    quality_grade: Optional[str] = Field(None, pattern="^[ABC]$")
    is_organic: Optional[bool] = None
    status: Optional[str] = Field(None, pattern="^(active|paused|sold_out|removed)$")
    image_urls: Optional[List[str]] = None


class ListingOut(BaseModel):
    id: str
    farmer_id: str
    crop_yield_id: Optional[str] = None
    crop_name: str
    description: Optional[str] = None
    price_per_kg: float
    quantity_available_kg: float
    min_order_kg: float
    quality_grade: str
    is_organic: bool
    image_urls: List[str] = []
    status: str
    created_at: datetime
    updated_at: datetime
    # Nested farmer details for customer view
    farmer_name: Optional[str] = None
    farmer_district: Optional[str] = None
    farmer_state: Optional[str] = None
    farmer_rating: Optional[float] = 0.0

    class Config:
        from_attributes = True


class ListingListResponse(BaseModel):
    items: List[ListingOut]
    total: int
    page: int
    page_size: int
