from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import Optional, List, Dict, Any

from app.models.listing import CropListing
from app.models.farmer_profile import FarmerProfile
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingUpdate, ListingOut, ListingListResponse


async def create_crop_listing(db: AsyncSession, farmer_id: str, data: ListingCreate) -> ListingOut:
    # Service check: farmer must be approved (FR-10, Sec 5.3)
    f_query = select(FarmerProfile).where(FarmerProfile.user_id == farmer_id)
    farmer_prof = (await db.execute(f_query)).scalar_one_or_none()
    
    if not farmer_prof or farmer_prof.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "Farmer verification is pending or not approved", "code": "FARMER_NOT_VERIFIED"}
        )

    listing = CropListing(
        farmer_id=farmer_id,
        crop_name=data.crop_name,
        description=data.description,
        price_per_kg=data.price_per_kg,
        quantity_available_kg=data.quantity_available_kg,
        min_order_kg=data.min_order_kg,
        quality_grade=data.quality_grade,
        is_organic=data.is_organic,
        crop_yield_id=data.crop_yield_id,
        image_urls=data.image_urls or ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600"],
        status="active"
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)

    # Return with farmer details
    user = (await db.execute(select(User).where(User.id == farmer_id))).scalar_one_or_none()
    return ListingOut(
        id=str(listing.id),
        farmer_id=str(listing.farmer_id),
        crop_yield_id=str(listing.crop_yield_id) if listing.crop_yield_id else None,
        crop_name=listing.crop_name,
        description=listing.description,
        price_per_kg=float(listing.price_per_kg),
        quantity_available_kg=float(listing.quantity_available_kg),
        min_order_kg=float(listing.min_order_kg),
        quality_grade=listing.quality_grade,
        is_organic=listing.is_organic,
        image_urls=listing.image_urls or [],
        status=listing.status,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        farmer_name=user.full_name if user else "Farmer",
        farmer_district=farmer_prof.district,
        farmer_state=farmer_prof.state,
        farmer_rating=float(farmer_prof.avg_rating or 0.0)
    )


async def get_public_listings(
    db: AsyncSession,
    crop: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    organic: Optional[bool] = None,
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> ListingListResponse:
    query = select(CropListing, FarmerProfile, User).join(
        FarmerProfile, CropListing.farmer_id == FarmerProfile.user_id
    ).join(
        User, FarmerProfile.user_id == User.id
    ).where(CropListing.status == "active")

    if crop:
        query = query.where(CropListing.crop_name.ilike(f"%{crop}%"))
    if state:
        query = query.where(FarmerProfile.state.ilike(f"%{state}%"))
    if district:
        query = query.where(FarmerProfile.district.ilike(f"%{district}%"))
    if min_price is not None:
        query = query.where(CropListing.price_per_kg >= min_price)
    if max_price is not None:
        query = query.where(CropListing.price_per_kg <= max_price)
    if organic is not None:
        query = query.where(CropListing.is_organic == organic)
    if q:
        query = query.where(
            or_(
                CropListing.crop_name.ilike(f"%{q}%"),
                CropListing.description.ilike(f"%{q}%"),
                FarmerProfile.farm_name.ilike(f"%{q}%"),
                User.full_name.ilike(f"%{q}%")
            )
        )

    # Count total
    total_res = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_res.scalar_one()

    # Pagination
    offset = (page - 1) * page_size
    query = query.order_by(CropListing.created_at.desc()).offset(offset).limit(page_size)
    rows = (await db.execute(query)).all()

    items = []
    for listing, farmer_prof, user in rows:
        items.append(
            ListingOut(
                id=str(listing.id),
                farmer_id=str(listing.farmer_id),
                crop_yield_id=str(listing.crop_yield_id) if listing.crop_yield_id else None,
                crop_name=listing.crop_name,
                description=listing.description,
                price_per_kg=float(listing.price_per_kg),
                quantity_available_kg=float(listing.quantity_available_kg),
                min_order_kg=float(listing.min_order_kg),
                quality_grade=listing.quality_grade,
                is_organic=listing.is_organic,
                image_urls=listing.image_urls or [],
                status=listing.status,
                created_at=listing.created_at,
                updated_at=listing.updated_at,
                farmer_name=user.full_name,
                farmer_district=farmer_prof.district,
                farmer_state=farmer_prof.state,
                farmer_rating=float(farmer_prof.avg_rating or 0.0)
            )
        )

    return ListingListResponse(items=items, total=total, page=page, page_size=page_size)


async def get_listing_by_id(db: AsyncSession, listing_id: str) -> ListingOut:
    query = select(CropListing, FarmerProfile, User).join(
        FarmerProfile, CropListing.farmer_id == FarmerProfile.user_id
    ).join(
        User, FarmerProfile.user_id == User.id
    ).where(CropListing.id == listing_id)

    row = (await db.execute(query)).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Listing not found", "code": "NOT_FOUND"}
        )

    listing, farmer_prof, user = row
    return ListingOut(
        id=str(listing.id),
        farmer_id=str(listing.farmer_id),
        crop_yield_id=str(listing.crop_yield_id) if listing.crop_yield_id else None,
        crop_name=listing.crop_name,
        description=listing.description,
        price_per_kg=float(listing.price_per_kg),
        quantity_available_kg=float(listing.quantity_available_kg),
        min_order_kg=float(listing.min_order_kg),
        quality_grade=listing.quality_grade,
        is_organic=listing.is_organic,
        image_urls=listing.image_urls or [],
        status=listing.status,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        farmer_name=user.full_name,
        farmer_district=farmer_prof.district,
        farmer_state=farmer_prof.state,
        farmer_rating=float(farmer_prof.avg_rating or 0.0)
    )


async def get_farmer_own_listings(db: AsyncSession, farmer_id: str) -> List[ListingOut]:
    query = select(CropListing).where(CropListing.farmer_id == farmer_id).order_by(CropListing.created_at.desc())
    listings = (await db.execute(query)).scalars().all()

    return [
        ListingOut(
            id=str(l.id),
            farmer_id=str(l.farmer_id),
            crop_yield_id=str(l.crop_yield_id) if l.crop_yield_id else None,
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
            updated_at=l.updated_at
        ) for l in listings
    ]


async def update_farmer_listing(db: AsyncSession, farmer_id: str, listing_id: str, data: ListingUpdate) -> ListingOut:
    query = select(CropListing).where(and_(CropListing.id == listing_id, CropListing.farmer_id == farmer_id))
    listing = (await db.execute(query)).scalar_one_or_none()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Listing not found or unauthorized", "code": "NOT_FOUND"}
        )

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(listing, field, val)

    await db.commit()
    await db.refresh(listing)
    return await get_listing_by_id(db, str(listing.id))


async def delete_farmer_listing(db: AsyncSession, farmer_id: str, listing_id: str) -> dict:
    query = select(CropListing).where(and_(CropListing.id == listing_id, CropListing.farmer_id == farmer_id))
    listing = (await db.execute(query)).scalar_one_or_none()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Listing not found or unauthorized", "code": "NOT_FOUND"}
        )
    listing.status = "removed"
    await db.commit()
    return {"status": "success", "message": "Listing removed"}
