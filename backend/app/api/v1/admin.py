from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.core.deps import require_role
from app.models.user import User
from app.models.listing import CropListing
from app.models.review import Review
from app.models.dispute import Dispute
from app.models.order import Order
from app.models.admin_log import AdminLog
from app.schemas.admin import (
    AdminDashboardStats,
    FarmerVerificationAction,
    UserStatusUpdate,
    AdminLogOut
)
from app.schemas.notification import BroadcastNotificationRequest
from app.schemas.user import UserOut
from app.schemas.order import OrderOut
from app.schemas.dispute import DisputeOut, DisputeResolveRequest
from app.services.admin_service import (
    get_dashboard_stats,
    get_pending_farmers_queue,
    verify_farmer_action,
    list_users_for_admin,
    set_user_status,
    get_admin_logs,
    get_admin_analytics_data,
    broadcast_announcement
)
from app.services.order_service import get_order_by_id

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get("/dashboard", response_model=AdminDashboardStats)
async def dashboard(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    return await get_dashboard_stats(db)


@router.get("/farmers/pending", response_model=List[UserOut])
async def pending_farmers(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    return await get_pending_farmers_queue(db)


@router.post("/farmers/{id}/verify")
async def verify_farmer(
    id: str,
    data: FarmerVerificationAction,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    return await verify_farmer_action(db, str(current_user.id), id, data)


@router.get("/users", response_model=List[UserOut])
async def users_list(
    role: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    return await list_users_for_admin(db, role, q)


@router.patch("/users/{id}/status")
async def update_user_status(
    id: str,
    data: UserStatusUpdate,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    return await set_user_status(db, str(current_user.id), id, data)


@router.get("/transactions", response_model=List[OrderOut])
async def transactions_list(
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    query = select(Order.id).order_by(Order.placed_at.desc())
    if status:
        query = query.where(Order.status == status)
    order_ids = (await db.execute(query)).scalars().all()
    return [await get_order_by_id(db, str(oid)) for oid in order_ids]


@router.get("/disputes", response_model=List[DisputeOut])
async def disputes_list(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    query = select(Dispute, User, Order).join(User, Dispute.raised_by == User.id).join(Order, Dispute.order_id == Order.id).order_by(Dispute.created_at.desc())
    rows = (await db.execute(query)).all()
    return [
        DisputeOut(
            id=str(d.id),
            order_id=str(d.order_id),
            raised_by=str(d.raised_by),
            reason=d.reason,
            status=d.status,
            resolution_note=d.resolution_note,
            resolved_by=str(d.resolved_by) if d.resolved_by else None,
            created_at=d.created_at,
            resolved_at=d.resolved_at,
            raised_by_name=u.full_name,
            order_no=o.order_no
        ) for d, u, o in rows
    ]


@router.patch("/disputes/{id}")
async def resolve_dispute(
    id: str,
    data: DisputeResolveRequest,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    dispute = (await db.execute(select(Dispute).where(Dispute.id == id))).scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Dispute not found", "code": "NOT_FOUND"})

    dispute.status = data.status
    dispute.resolution_note = data.resolution_note
    dispute.resolved_by = current_user.id
    dispute.resolved_at = datetime.now()

    # Log to admin
    log = AdminLog(
        actor_id=current_user.id,
        action_type="DISPUTE_RESOLVED",
        target_type="dispute",
        target_id=dispute.id,
        remarks=f"Dispute {id} marked {data.status}: {data.resolution_note}"
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "message": "Dispute updated"}


@router.delete("/listings/{id}")
async def remove_listing_moderation(
    id: str,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    listing = (await db.execute(select(CropListing).where(CropListing.id == id))).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Listing not found", "code": "NOT_FOUND"})

    listing.status = "removed"
    log = AdminLog(
        actor_id=current_user.id,
        action_type="LISTING_REMOVED",
        target_type="crop_listing",
        target_id=listing.id,
        remarks=f"Admin removed listing {listing.crop_name} due to policy violation"
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "message": "Listing removed by moderation"}


@router.patch("/reviews/{id}/hide")
async def hide_review_moderation(
    id: str,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    review = (await db.execute(select(Review).where(Review.id == id))).scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Review not found", "code": "NOT_FOUND"})

    review.is_hidden = True
    log = AdminLog(
        actor_id=current_user.id,
        action_type="REVIEW_HIDDEN",
        target_type="review",
        target_id=review.id,
        remarks="Admin hid abusive review"
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "message": "Review hidden"}


@router.get("/analytics/demand")
async def get_analytics_demand(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    data = await get_admin_analytics_data(db)
    return {"crop_demand": data["crop_demand"]}


@router.get("/analytics/disease-hotspots")
async def get_analytics_hotspots(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    data = await get_admin_analytics_data(db)
    return {"hotspots": data["hotspots"]}


@router.get("/analytics/sales")
async def get_analytics_sales(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    data = await get_admin_analytics_data(db)
    return {"regional_sales": data["regional_sales"]}


@router.post("/notifications/broadcast")
async def send_broadcast(
    data: BroadcastNotificationRequest,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    return await broadcast_announcement(
        db, str(current_user.id), data.title, data.body, data.audience
    )


@router.get("/logs", response_model=List[AdminLogOut])
async def audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    return await get_admin_logs(db, limit)
