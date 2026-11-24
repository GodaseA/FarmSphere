from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DisputeCreateRequest(BaseModel):
    reason: str


class DisputeResolveRequest(BaseModel):
    status: str  # 'resolved', 'rejected'
    resolution_note: str


class DisputeOut(BaseModel):
    id: str
    order_id: str
    raised_by: str
    reason: str
    status: str
    resolution_note: Optional[str] = None
    resolved_by: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    raised_by_name: Optional[str] = None
    order_no: Optional[str] = None

    class Config:
        from_attributes = True
