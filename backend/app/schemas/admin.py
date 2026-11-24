from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.user import UserOut


class AdminDashboardStats(BaseModel):
    total_farmers: int
    pending_farmers: int
    total_customers: int
    active_listings: int
    total_orders: int
    total_revenue: float
    total_predictions: int
    open_disputes: int


class FarmerVerificationAction(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")
    rejection_reason: Optional[str] = None


class UserStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(active|blocked)$")


class AdminLogOut(BaseModel):
    id: int
    actor_id: Optional[str] = None
    action_type: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime
    actor_name: Optional[str] = None

    class Config:
        from_attributes = True


class AdminAnalyticsDemand(BaseModel):
    crop_demand: List[Dict[str, Any]]


class AdminAnalyticsHotspots(BaseModel):
    hotspots: List[Dict[str, Any]]


class AdminAnalyticsSales(BaseModel):
    regional_sales: List[Dict[str, Any]]
