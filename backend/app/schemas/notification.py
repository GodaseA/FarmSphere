from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BroadcastNotificationRequest(BaseModel):
    audience: str = Field("all", pattern="^(all|farmers|customers)$")
    title: str = Field(..., max_length=160)
    body: str


class NotificationOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    audience: str
    title: str
    body: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
