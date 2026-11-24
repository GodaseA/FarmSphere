from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.deps import require_role
from app.models.user import User
from app.schemas.cart import AddToCartRequest, UpdateCartItemRequest, CartOut
from app.services.cart_service import get_or_create_customer_cart, add_item_to_cart, update_cart_item, remove_cart_item, clear_cart

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])


@router.get("", response_model=CartOut)
async def view_cart(
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_or_create_customer_cart(db, str(current_user.id))


@router.post("", response_model=CartOut)
async def add_item(
    data: AddToCartRequest,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await add_item_to_cart(db, str(current_user.id), data)


@router.delete("")
async def empty_cart(
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await clear_cart(db, str(current_user.id))


@router.put("/items/{id}", response_model=CartOut)
async def update_quantity(
    id: str,
    data: UpdateCartItemRequest,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await update_cart_item(db, str(current_user.id), id, data)


@router.delete("/items/{id}", response_model=CartOut)
async def remove_item(
    id: str,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db)
):
    return await remove_cart_item(db, str(current_user.id), id)
