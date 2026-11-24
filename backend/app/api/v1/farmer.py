from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_db
from app.core.deps import require_role, require_approved_farmer
from app.models.user import User
from app.schemas.yield_schema import CropYieldCreate, CropYieldUpdate, CropYieldResponse, YieldAnalyticsResponse
from app.schemas.listing import ListingCreate, ListingUpdate, ListingOut
from app.schemas.order import OrderOut, OrderStatusUpdateRequest
from app.schemas.review import ReviewOut
from app.services.yield_service import create_yield, get_farmer_yields, update_yield, delete_yield, get_yield_analytics
from app.services.listing_service import create_crop_listing, get_farmer_own_listings, update_farmer_listing, delete_farmer_listing
from app.services.order_service import get_farmer_orders, update_order_status_by_farmer
from app.services.review_service import get_farmer_reviews

router = APIRouter(prefix="/farmer", tags=["Farmer"])


# --- Crop Yield Endpoints ---
@router.post("/yields", response_model=CropYieldResponse)
async def add_yield(
    data: CropYieldCreate,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await create_yield(db, str(current_user.id), data)


@router.get("/yields", response_model=List[CropYieldResponse])
async def list_yields(
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_farmer_yields(db, str(current_user.id))


@router.get("/yields/analytics", response_model=YieldAnalyticsResponse)
async def yield_analytics(
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_yield_analytics(db, str(current_user.id))


@router.put("/yields/{id}", response_model=CropYieldResponse)
async def edit_yield(
    id: str,
    data: CropYieldUpdate,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await update_yield(db, str(current_user.id), id, data)


@router.delete("/yields/{id}")
async def remove_yield(
    id: str,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await delete_yield(db, str(current_user.id), id)


# --- Produce Listings Endpoints ---
@router.post("/listings", response_model=ListingOut)
async def create_listing(
    data: ListingCreate,
    current_user: User = Depends(require_approved_farmer),
    db: AsyncSession = Depends(get_db)
):
    return await create_crop_listing(db, str(current_user.id), data)


@router.get("/listings", response_model=List[ListingOut])
async def my_listings(
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_farmer_own_listings(db, str(current_user.id))


@router.put("/listings/{id}", response_model=ListingOut)
async def update_listing(
    id: str,
    data: ListingUpdate,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await update_farmer_listing(db, str(current_user.id), id, data)


@router.delete("/listings/{id}")
async def delete_listing(
    id: str,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await delete_farmer_listing(db, str(current_user.id), id)


# --- Order Fulfillment Endpoints ---
@router.get("/orders", response_model=List[OrderOut])
async def incoming_orders(
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_farmer_orders(db, str(current_user.id), status)


@router.patch("/orders/{id}/status", response_model=OrderOut)
async def update_status(
    id: str,
    data: OrderStatusUpdateRequest,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await update_order_status_by_farmer(db, str(current_user.id), id, data.status)


# --- Reviews Endpoints ---
@router.get("/reviews", response_model=List[ReviewOut])
async def received_reviews(
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_farmer_reviews(db, str(current_user.id))
