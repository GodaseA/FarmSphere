from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from fastapi import HTTPException, status
from typing import List

from app.models.review import Review
from app.models.order import Order
from app.models.farmer_profile import FarmerProfile
from app.models.user import User
from app.schemas.review import ReviewCreateRequest, ReviewOut


async def create_order_review(
    db: AsyncSession,
    customer_id: str,
    order_id: str,
    data: ReviewCreateRequest
) -> ReviewOut:
    order = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Order not found", "code": "NOT_FOUND"}
        )

    if str(order.customer_id) != customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "You can only review your own orders", "code": "FORBIDDEN"}
        )

    # Must be delivered
    if order.status != "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"detail": "Reviews can only be submitted after the order has been delivered", "code": "ORDER_NOT_DELIVERED"}
        )

    # Check already reviewed
    existing = (await db.execute(select(Review).where(Review.order_id == order_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"detail": "A review has already been submitted for this order", "code": "REVIEW_EXISTS"}
        )

    review = Review(
        order_id=order_id,
        customer_id=customer_id,
        farmer_id=order.farmer_id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(review)
    await db.flush()

    # Recalculate farmer rating
    f_prof = (await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == order.farmer_id))).scalar_one_or_none()
    if f_prof:
        avg_q = select(func.avg(Review.rating), func.count(Review.id)).where(Review.farmer_id == order.farmer_id)
        avg_res = (await db.execute(avg_q)).first()
        if avg_res:
            f_prof.avg_rating = round(float(avg_res[0] or 0), 1)
            f_prof.rating_count = int(avg_res[1] or 0)

    await db.commit()
    await db.refresh(review)

    c_user = (await db.execute(select(User).where(User.id == customer_id))).scalar_one_or_none()

    return ReviewOut(
        id=str(review.id),
        order_id=str(review.order_id),
        customer_id=str(review.customer_id),
        farmer_id=str(review.farmer_id),
        rating=review.rating,
        comment=review.comment,
        is_hidden=review.is_hidden,
        created_at=review.created_at,
        customer_name=c_user.full_name if c_user else "Customer"
    )


async def get_farmer_reviews(db: AsyncSession, farmer_id: str) -> List[ReviewOut]:
    query = select(Review, User).join(User, Review.customer_id == User.id).where(
        and_(Review.farmer_id == farmer_id, Review.is_hidden == False)
    ).order_by(Review.created_at.desc())
    rows = (await db.execute(query)).all()

    return [
        ReviewOut(
            id=str(r.id),
            order_id=str(r.order_id),
            customer_id=str(r.customer_id),
            farmer_id=str(r.farmer_id),
            rating=r.rating,
            comment=r.comment,
            is_hidden=r.is_hidden,
            created_at=r.created_at,
            customer_name=u.full_name
        ) for r, u in rows
    ]
