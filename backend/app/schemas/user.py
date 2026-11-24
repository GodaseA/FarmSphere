from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class FarmerProfileOut(BaseModel):
    user_id: str
    farm_name: Optional[str] = None
    village: Optional[str] = None
    district: str
    state: str
    pincode: Optional[str] = None
    land_size_acres: float
    id_proof_url: str
    land_proof_url: Optional[str] = None
    verification_status: str
    rejection_reason: Optional[str] = None
    avg_rating: float = 0.0
    rating_count: int = 0

    class Config:
        from_attributes = True


class CustomerProfileOut(BaseModel):
    user_id: str
    address_line: str
    city: str
    district: Optional[str] = None
    state: str
    pincode: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: str
    full_name: str
    email: Optional[str] = None
    phone: str
    role: str
    status: str
    avatar_url: Optional[str] = None
    preferred_language: str = "en"
    created_at: datetime
    farmer_profile: Optional[FarmerProfileOut] = None
    customer_profile: Optional[CustomerProfileOut] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = None
    # Customer specific
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    # Farmer specific
    farm_name: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
