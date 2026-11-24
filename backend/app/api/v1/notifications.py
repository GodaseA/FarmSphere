from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from typing import List

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Notification).where(
        or_(
            Notification.user_id == current_user.id,
            Notification.audience == "all",
            and_(Notification.audience == "farmers", current_user.role == "farmer"),
            and_(Notification.audience == "customers", current_user.role == "customer"),
        )
    ).order_by(Notification.created_at.desc()).limit(30)

    records = (await db.execute(query)).scalars().all()
    return [
        NotificationOut(
            id=str(n.id),
            user_id=str(n.user_id) if n.user_id else None,
            audience=n.audience,
            title=n.title,
            body=n.body,
            is_read=n.is_read,
            created_at=n.created_at
        ) for n in records
    ]


@router.patch("/{id}/read")
async def mark_notification_read(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notif = (await db.execute(select(Notification).where(Notification.id == id))).scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"status": "success", "message": "Notification marked read"}
