from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.db.session import get_db
from app.models.farmer_profile import FarmerProfile
from app.models.user import User
from app.schemas.listing import ListingListResponse, ListingOut
from app.services.listing_service import get_public_listings, get_listing_by_id

router = APIRouter(tags=["Marketplace Listings"])


@router.get("/listings", response_model=ListingListResponse)
async def list_listings(
    crop: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    organic: Optional[bool] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    return await get_public_listings(
        db, crop, state, district, min_price, max_price, organic, q, page, page_size
    )


@router.get("/listings/{id}", response_model=ListingOut)
async def get_single_listing(id: str, db: AsyncSession = Depends(get_db)):
    return await get_listing_by_id(db, id)


@router.get("/farmers/{id}")
async def get_public_farmer_profile(id: str, db: AsyncSession = Depends(get_db)):
    f_prof = (await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == id))).scalar_one_or_none()
    user = (await db.execute(select(User).where(User.id == id))).scalar_one_or_none()
    if not f_prof or not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"detail": "Farmer not found", "code": "NOT_FOUND"})

    # Get farmer listings count
    listings_res = await get_public_listings(db, page=1, page_size=20)
    farmer_listings = [item for item in listings_res.items if item.farmer_id == id]

    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "farm_name": f_prof.farm_name,
        "village": f_prof.village,
        "district": f_prof.district,
        "state": f_prof.state,
        "land_size_acres": float(f_prof.land_size_acres),
        "avg_rating": float(f_prof.avg_rating or 0.0),
        "rating_count": f_prof.rating_count,
        "verification_status": f_prof.verification_status,
        "active_listings": farmer_listings
    }
