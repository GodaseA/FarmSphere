from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.customer_profile import CustomerProfile
from app.models.listing import CropListing
from app.models.order import Order, OrderItem
from app.models.disease import DiseasePrediction
from app.models.dispute import Dispute
from app.models.admin_log import AdminLog
from app.models.review import Review
from app.models.notification import Notification
from app.schemas.admin import AdminDashboardStats, FarmerVerificationAction, UserStatusUpdate, AdminLogOut
from app.schemas.user import UserOut


async def get_dashboard_stats(db: AsyncSession) -> AdminDashboardStats:
    total_farmers = (await db.execute(select(func.count(User.id)).where(User.role == "farmer"))).scalar_one()
    pending_farmers = (await db.execute(select(func.count(FarmerProfile.user_id)).where(FarmerProfile.verification_status == "pending"))).scalar_one()
    total_customers = (await db.execute(select(func.count(User.id)).where(User.role == "customer"))).scalar_one()
    active_listings = (await db.execute(select(func.count(CropListing.id)).where(CropListing.status == "active"))).scalar_one()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar_one()
    total_rev = (await db.execute(select(func.coalesce(func.sum(Order.total_amount), 0.0)).where(Order.status != "cancelled"))).scalar_one()
    total_preds = (await db.execute(select(func.count(DiseasePrediction.id)))).scalar_one()
    open_disputes = (await db.execute(select(func.count(Dispute.id)).where(Dispute.status == "open"))).scalar_one()

    return AdminDashboardStats(
        total_farmers=total_farmers,
        pending_farmers=pending_farmers,
        total_customers=total_customers,
        active_listings=active_listings,
        total_orders=total_orders,
        total_revenue=float(total_rev),
        total_predictions=total_preds,
        open_disputes=open_disputes
    )


async def get_pending_farmers_queue(db: AsyncSession) -> List[UserOut]:
    query = select(User).options(
        selectinload(User.farmer_profile)
    ).join(
        FarmerProfile, User.id == FarmerProfile.user_id
    ).where(
        FarmerProfile.verification_status == "pending"
    )
    users = (await db.execute(query)).scalars().all()
    return [UserOut.model_validate(u) for u in users]


async def verify_farmer_action(
    db: AsyncSession,
    admin_id: str,
    farmer_id: str,
    data: FarmerVerificationAction
) -> dict:
    f_prof = (await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == farmer_id))).scalar_one_or_none()
    if not f_prof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Farmer profile not found", "code": "NOT_FOUND"}
        )

    if data.action == "approve":
        f_prof.verification_status = "approved"
        f_prof.verified_by = admin_id
        f_prof.verified_at = datetime.now()
        f_prof.rejection_reason = None
        remarks = "Farmer approved by admin"
    else:
        f_prof.verification_status = "rejected"
        f_prof.rejection_reason = data.rejection_reason or "Documents insufficient"
        remarks = f"Farmer rejected. Reason: {f_prof.rejection_reason}"

    # Write admin log
    log = AdminLog(
        actor_id=admin_id,
        action_type=f"FARMER_{data.action.upper()}",
        target_type="farmer_profile",
        target_id=f_prof.user_id,
        remarks=remarks
    )
    db.add(log)

    # In-app notification to the farmer
    notif = Notification(
        user_id=farmer_id,
        title=f"Verification {data.action.capitalize()}d",
        body="Your farmer account has been approved! You can now post produce listings." if data.action == "approve" else f"Your verification was rejected: {f_prof.rejection_reason}"
    )
    db.add(notif)

    await db.commit()
    return {"status": "success", "verification_status": f_prof.verification_status}


async def list_users_for_admin(db: AsyncSession, role: Optional[str] = None, q: Optional[str] = None) -> List[UserOut]:
    query = select(User).options(
        selectinload(User.farmer_profile),
        selectinload(User.customer_profile)
    )
    if role:
        query = query.where(User.role == role)
    if q:
        query = query.where(
            or_(
                User.full_name.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%"),
                User.phone.ilike(f"%{q}%")
            )
        )
    query = query.order_by(User.created_at.desc())
    users = (await db.execute(query)).scalars().all()
    return [UserOut.model_validate(u) for u in users]


async def set_user_status(db: AsyncSession, admin_id: str, user_id: str, data: UserStatusUpdate) -> dict:
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "User not found", "code": "NOT_FOUND"}
        )

    user.status = data.status
    log = AdminLog(
        actor_id=admin_id,
        action_type=f"USER_{data.status.upper()}",
        target_type="user",
        target_id=user.id,
        remarks=f"User status updated to {data.status}"
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "user_id": user_id, "new_status": user.status}


async def get_admin_logs(db: AsyncSession, limit: int = 50) -> List[AdminLogOut]:
    query = select(AdminLog, User).outerjoin(User, AdminLog.actor_id == User.id).order_by(AdminLog.created_at.desc()).limit(limit)
    rows = (await db.execute(query)).all()
    results = []
    for log, actor in rows:
        results.append(
            AdminLogOut(
                id=log.id,
                actor_id=str(log.actor_id) if log.actor_id else None,
                action_type=log.action_type,
                target_type=log.target_type,
                target_id=str(log.target_id) if log.target_id else None,
                remarks=log.remarks,
                created_at=log.created_at,
                actor_name=actor.full_name if actor else "System"
            )
        )
    return results


async def get_admin_analytics_data(db: AsyncSession) -> Dict[str, Any]:
    # Demand: items ordered per crop
    demand_q = select(OrderItem.crop_name, func.sum(OrderItem.quantity_kg), func.count(OrderItem.id)).group_by(OrderItem.crop_name)
    demand_rows = (await db.execute(demand_q)).all()
    crop_demand = [{"crop": r[0], "total_kg": float(r[1] or 0), "orders_count": int(r[2])} for r in demand_rows]

    # Hotspots: disease predictions grouped by region (district, state, predicted_class)
    hotspots_q = select(
        DiseasePrediction.district,
        DiseasePrediction.state,
        DiseasePrediction.predicted_class,
        func.count(DiseasePrediction.id)
    ).group_by(
        DiseasePrediction.district,
        DiseasePrediction.state,
        DiseasePrediction.predicted_class
    )
    hotspot_rows = (await db.execute(hotspots_q)).all()
    hotspots = [
        {"district": r[0] or "Unknown", "state": r[1] or "Unknown", "disease": r[2], "incidents": int(r[3])}
        for r in hotspot_rows
    ]

    # Regional Sales: orders by state & district of the farmer
    sales_q = select(
        FarmerProfile.state,
        FarmerProfile.district,
        func.sum(Order.total_amount),
        func.count(Order.id)
    ).join(
        Order, FarmerProfile.user_id == Order.farmer_id
    ).group_by(FarmerProfile.state, FarmerProfile.district)
    sales_rows = (await db.execute(sales_q)).all()
    regional_sales = [
        {"state": r[0], "district": r[1], "revenue": float(r[2] or 0), "order_count": int(r[3])}
        for r in sales_rows
    ]

    return {
        "crop_demand": crop_demand,
        "hotspots": hotspots,
        "regional_sales": regional_sales
    }


async def broadcast_announcement(db: AsyncSession, admin_id: str, title: str, body: str, audience: str) -> dict:
    notif = Notification(
        user_id=None,
        audience=audience,
        title=title,
        body=body
    )
    db.add(notif)
    log = AdminLog(
        actor_id=admin_id,
        action_type="BROADCAST_SENT",
        target_type="notification",
        remarks=f"Broadcast: '{title}' to {audience}"
    )
    db.add(log)
    await db.commit()
    return {"status": "success", "message": f"Broadcast sent to {audience}"}
