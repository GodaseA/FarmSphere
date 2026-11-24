import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem
from app.models.listing import CropListing
from app.models.admin_log import AdminLog
from app.models.payment import Payment
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.customer_profile import CustomerProfile
from app.models.review import Review
from app.schemas.order import OrderCreateRequest, OrderOut, OrderItemOut


async def checkout_cart_to_orders(
    db: AsyncSession,
    customer_id: str,
    data: OrderCreateRequest
) -> List[OrderOut]:
    """
    Atomic transaction:
    1. Loads customer's cart items
    2. Validates stock for all items
    3. Groups items by farmer
    4. Decrements listing stock
    5. Creates Order & OrderItems per farmer
    6. Creates Payment record
    7. Clears cart
    8. Writes AdminLog
    """
    # 1. Fetch Cart with Items and Listing
    c_query = select(Cart).options(
        selectinload(Cart.items).selectinload(CartItem.listing)
    ).where(Cart.customer_id == customer_id)
    cart = (await db.execute(c_query)).scalar_one_or_none()

    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"detail": "Your shopping cart is empty", "code": "EMPTY_CART"}
        )

    # Group by farmer_id
    items_by_farmer = {}
    for item in cart.items:
        listing = item.listing
        if not listing or listing.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"detail": f"Item {listing.crop_name if listing else 'Item'} is no longer available", "code": "ITEM_UNAVAILABLE"}
            )
        
        # Check stock (NFR-04, 10.3)
        if float(listing.quantity_available_kg) < float(item.quantity_kg):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "detail": f"Insufficient stock for {listing.crop_name}. Available: {listing.quantity_available_kg}kg, requested: {item.quantity_kg}kg",
                    "code": "INSUFFICIENT_STOCK"
                }
            )

        items_by_farmer.setdefault(str(listing.farmer_id), []).append(item)

    # Customer profile for address
    cust_prof = (await db.execute(select(CustomerProfile).where(CustomerProfile.user_id == customer_id))).scalar_one_or_none()
    delivery_addr = data.delivery_address or (
        f"{cust_prof.address_line}, {cust_prof.city}, {cust_prof.state} - {cust_prof.pincode}" if cust_prof else "Standard Delivery Address"
    )

    created_orders: List[Order] = []

    # Process each farmer order
    for farmer_id, cart_items_list in items_by_farmer.items():
        order_total = 0.0
        order_no = f"ORD-{int(datetime.now().timestamp())}-{str(uuid.uuid4())[:4].upper()}"

        order = Order(
            order_no=order_no,
            customer_id=customer_id,
            farmer_id=farmer_id,
            fulfilment=data.fulfilment,
            delivery_address=delivery_addr,
            total_amount=0.0,
            status="pending"
        )
        db.add(order)
        await db.flush()

        for ci in cart_items_list:
            listing = ci.listing
            line_total = round(float(listing.price_per_kg) * float(ci.quantity_kg), 2)
            order_total += line_total

            # Atomic stock decrement
            listing.quantity_available_kg = float(listing.quantity_available_kg) - float(ci.quantity_kg)
            if listing.quantity_available_kg <= 0:
                listing.status = "sold_out"

            # Create OrderItem preserving historical price and crop name
            oi = OrderItem(
                order_id=order.id,
                listing_id=listing.id,
                crop_name=listing.crop_name,
                unit_price=listing.price_per_kg,
                quantity_kg=ci.quantity_kg,
                line_total=line_total
            )
            db.add(oi)

        order.total_amount = round(order_total, 2)

        # Create Payment record
        pm = Payment(
            order_id=order.id,
            method=data.payment_method,
            status="paid" if data.payment_method == "online" else "initiated",
            amount=round(order_total, 2),
            gateway_order_id=f"pay_order_{uuid.uuid4().hex[:12]}" if data.payment_method == "online" else None
        )
        db.add(pm)

        # Audit log (NFR-07, Sec 6)
        log = AdminLog(
            actor_id=customer_id,
            action_type="ORDER_CREATED",
            target_type="order",
            target_id=order.id,
            remarks=f"Order {order_no} created with total {order.total_amount}"
        )
        db.add(log)
        created_orders.append(order)

    # Clear customer cart
    for item in cart.items:
        await db.delete(item)

    await db.commit()

    # Form responses
    responses = []
    for o in created_orders:
        res = await get_order_by_id(db, str(o.id))
        responses.append(res)
    return responses


async def get_order_by_id(db: AsyncSession, order_id: str) -> OrderOut:
    query = select(Order).options(
        selectinload(Order.items),
        selectinload(Order.payment),
        selectinload(Order.review)
    ).where(Order.id == order_id)
    order = (await db.execute(query)).scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Order not found", "code": "NOT_FOUND"}
        )

    # Fetch names
    c_user = (await db.execute(select(User).where(User.id == order.customer_id))).scalar_one_or_none()
    f_user = (await db.execute(select(User).where(User.id == order.farmer_id))).scalar_one_or_none()

    return OrderOut(
        id=str(order.id),
        order_no=order.order_no,
        customer_id=str(order.customer_id),
        farmer_id=str(order.farmer_id),
        fulfilment=order.fulfilment,
        delivery_address=order.delivery_address,
        total_amount=float(order.total_amount),
        status=order.status,
        placed_at=order.placed_at,
        updated_at=order.updated_at,
        delivered_at=order.delivered_at,
        items=[
            OrderItemOut(
                id=str(i.id),
                listing_id=str(i.listing_id) if i.listing_id else None,
                crop_name=i.crop_name,
                unit_price=float(i.unit_price),
                quantity_kg=float(i.quantity_kg),
                line_total=float(i.line_total)
            ) for i in order.items
        ],
        customer_name=c_user.full_name if c_user else "Customer",
        farmer_name=f_user.full_name if f_user else "Farmer",
        payment_status=order.payment.status if order.payment else None,
        payment_method=order.payment.method if order.payment else None,
        has_review=order.review is not None
    )


async def get_customer_orders(db: AsyncSession, customer_id: str) -> List[OrderOut]:
    query = select(Order.id).where(Order.customer_id == customer_id).order_by(Order.placed_at.desc())
    order_ids = (await db.execute(query)).scalars().all()
    return [await get_order_by_id(db, str(oid)) for oid in order_ids]


async def get_farmer_orders(db: AsyncSession, farmer_id: str, status_filter: Optional[str] = None) -> List[OrderOut]:
    query = select(Order.id).where(Order.farmer_id == farmer_id)
    if status_filter:
        query = query.where(Order.status == status_filter)
    query = query.order_by(Order.placed_at.desc())
    order_ids = (await db.execute(query)).scalars().all()
    return [await get_order_by_id(db, str(oid)) for oid in order_ids]


async def update_order_status_by_farmer(
    db: AsyncSession,
    farmer_id: str,
    order_id: str,
    new_status: str
) -> OrderOut:
    order = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Order not found", "code": "NOT_FOUND"}
        )

    if str(order.farmer_id) != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "You can only update orders assigned to your farm", "code": "FORBIDDEN"}
        )

    # Valid transitions: pending -> confirmed -> shipped -> delivered, or rejected
    order.status = new_status
    if new_status == "delivered":
        order.delivered_at = datetime.now()

    # Log to admin_logs
    log = AdminLog(
        actor_id=farmer_id,
        action_type="ORDER_STATUS_CHANGED",
        target_type="order",
        target_id=order.id,
        remarks=f"Farmer changed order {order.order_no} status to {new_status}"
    )
    db.add(log)
    await db.commit()
    await db.refresh(order)

    return await get_order_by_id(db, str(order.id))
