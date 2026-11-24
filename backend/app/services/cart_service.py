from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.cart import Cart, CartItem
from app.models.listing import CropListing
from app.models.farmer_profile import FarmerProfile
from app.models.user import User
from app.schemas.cart import AddToCartRequest, UpdateCartItemRequest, CartOut, CartItemOut
from app.schemas.listing import ListingOut


async def get_or_create_customer_cart(db: AsyncSession, customer_id: str) -> CartOut:
    query = select(Cart).options(
        selectinload(Cart.items).selectinload(CartItem.listing)
    ).where(Cart.customer_id == customer_id)
    cart = (await db.execute(query)).scalar_one_or_none()

    if not cart:
        cart = Cart(customer_id=customer_id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
        return CartOut(id=str(cart.id), customer_id=str(cart.customer_id), items=[], total_amount=0.0)

    items_out = []
    total = 0.0
    for item in cart.items:
        l = item.listing
        if not l:
            continue
        line_cost = float(l.price_per_kg) * float(item.quantity_kg)
        total += line_cost

        # Get farmer info for display
        f_prof = (await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == l.farmer_id))).scalar_one_or_none()
        f_user = (await db.execute(select(User).where(User.id == l.farmer_id))).scalar_one_or_none()

        listing_out = ListingOut(
            id=str(l.id),
            farmer_id=str(l.farmer_id),
            crop_name=l.crop_name,
            description=l.description,
            price_per_kg=float(l.price_per_kg),
            quantity_available_kg=float(l.quantity_available_kg),
            min_order_kg=float(l.min_order_kg),
            quality_grade=l.quality_grade,
            is_organic=l.is_organic,
            image_urls=l.image_urls or [],
            status=l.status,
            created_at=l.created_at,
            updated_at=l.updated_at,
            farmer_name=f_user.full_name if f_user else "Farmer",
            farmer_district=f_prof.district if f_prof else None,
            farmer_state=f_prof.state if f_prof else None,
            farmer_rating=float(f_prof.avg_rating or 0.0) if f_prof else 0.0
        )

        items_out.append(
            CartItemOut(
                id=str(item.id),
                listing_id=str(item.listing_id),
                quantity_kg=float(item.quantity_kg),
                listing=listing_out
            )
        )

    return CartOut(
        id=str(cart.id),
        customer_id=str(cart.customer_id),
        items=items_out,
        total_amount=round(total, 2)
    )


async def add_item_to_cart(db: AsyncSession, customer_id: str, data: AddToCartRequest) -> CartOut:
    # Validate listing exists & has stock
    listing = (await db.execute(select(CropListing).where(CropListing.id == data.listing_id))).scalar_one_or_none()
    if not listing or listing.status != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Listing not available", "code": "NOT_FOUND"}
        )

    if float(listing.quantity_available_kg) < float(data.quantity_kg):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"detail": "Requested quantity exceeds available stock", "code": "INSUFFICIENT_STOCK"}
        )

    cart_query = select(Cart).where(Cart.customer_id == customer_id)
    cart = (await db.execute(cart_query)).scalar_one_or_none()
    if not cart:
        cart = Cart(customer_id=customer_id)
        db.add(cart)
        await db.flush()

    # Check existing cart item
    item_query = select(CartItem).where(and_(CartItem.cart_id == cart.id, CartItem.listing_id == data.listing_id))
    item = (await db.execute(item_query)).scalar_one_or_none()

    if item:
        new_qty = float(item.quantity_kg) + float(data.quantity_kg)
        if new_qty > float(listing.quantity_available_kg):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"detail": "Total quantity in cart exceeds available stock", "code": "INSUFFICIENT_STOCK"}
            )
        item.quantity_kg = new_qty
    else:
        item = CartItem(
            cart_id=cart.id,
            listing_id=data.listing_id,
            quantity_kg=data.quantity_kg
        )
        db.add(item)

    await db.commit()
    return await get_or_create_customer_cart(db, customer_id)


async def update_cart_item(db: AsyncSession, customer_id: str, item_id: str, data: UpdateCartItemRequest) -> CartOut:
    cart_query = select(Cart).where(Cart.customer_id == customer_id)
    cart = (await db.execute(cart_query)).scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Cart not found", "code": "NOT_FOUND"})

    item = (await db.execute(select(CartItem).where(and_(CartItem.id == item_id, CartItem.cart_id == cart.id)))).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Item not in cart", "code": "NOT_FOUND"})

    item.quantity_kg = data.quantity_kg
    await db.commit()
    return await get_or_create_customer_cart(db, customer_id)


async def remove_cart_item(db: AsyncSession, customer_id: str, item_id: str) -> CartOut:
    cart_query = select(Cart).where(Cart.customer_id == customer_id)
    cart = (await db.execute(cart_query)).scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Cart not found", "code": "NOT_FOUND"})

    item = (await db.execute(select(CartItem).where(and_(CartItem.id == item_id, CartItem.cart_id == cart.id)))).scalar_one_or_none()
    if item:
        await db.delete(item)
        await db.commit()

    return await get_or_create_customer_cart(db, customer_id)


async def clear_cart(db: AsyncSession, customer_id: str) -> dict:
    cart = (await db.execute(select(Cart).options(selectinload(Cart.items)).where(Cart.customer_id == customer_id))).scalar_one_or_none()
    if cart:
        for item in cart.items:
            await db.delete(item)
        await db.commit()
    return {"status": "success", "message": "Cart cleared"}
