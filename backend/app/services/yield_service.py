from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from fastapi import HTTPException, status
from typing import List, Dict, Any

from app.models.crop_yield import CropYield
from app.schemas.yield_schema import CropYieldCreate, CropYieldUpdate, CropYieldResponse, YieldAnalyticsResponse


async def create_yield(db: AsyncSession, farmer_id: str, data: CropYieldCreate) -> CropYieldResponse:
    rec = CropYield(
        farmer_id=farmer_id,
        crop_name=data.crop_name,
        season=data.season,
        year=data.year,
        sowing_date=data.sowing_date,
        harvest_date=data.harvest_date,
        quantity_kg=data.quantity_kg,
        land_area_acres=data.land_area_acres,
        notes=data.notes
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return CropYieldResponse.model_validate(rec)


async def get_farmer_yields(db: AsyncSession, farmer_id: str) -> List[CropYieldResponse]:
    query = select(CropYield).where(CropYield.farmer_id == farmer_id).order_by(CropYield.created_at.desc())
    result = await db.execute(query)
    records = result.scalars().all()
    return [CropYieldResponse.model_validate(r) for r in records]


async def update_yield(db: AsyncSession, farmer_id: str, yield_id: str, data: CropYieldUpdate) -> CropYieldResponse:
    query = select(CropYield).where(and_(CropYield.id == yield_id, CropYield.farmer_id == farmer_id))
    rec = (await db.execute(query)).scalar_one_or_none()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Yield record not found", "code": "NOT_FOUND"}
        )

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(rec, field, val)

    await db.commit()
    await db.refresh(rec)
    return CropYieldResponse.model_validate(rec)


async def delete_yield(db: AsyncSession, farmer_id: str, yield_id: str) -> dict:
    query = select(CropYield).where(and_(CropYield.id == yield_id, CropYield.farmer_id == farmer_id))
    rec = (await db.execute(query)).scalar_one_or_none()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "Yield record not found", "code": "NOT_FOUND"}
        )
    await db.delete(rec)
    await db.commit()
    return {"status": "success", "message": "Yield record deleted"}


async def get_yield_analytics(db: AsyncSession, farmer_id: str) -> YieldAnalyticsResponse:
    query = select(CropYield).where(CropYield.farmer_id == farmer_id)
    records = (await db.execute(query)).scalars().all()

    total_kg = sum(float(r.quantity_kg or 0) for r in records)
    total_acres = sum(float(r.land_area_acres or 0) for r in records)

    # Group by crop
    crop_map: Dict[str, float] = {}
    season_map: Dict[str, float] = {}
    year_map: Dict[int, float] = {}

    for r in records:
        c_name = r.crop_name
        crop_map[c_name] = crop_map.get(c_name, 0.0) + float(r.quantity_kg or 0)

        s_name = r.season.title()
        season_map[s_name] = season_map.get(s_name, 0.0) + float(r.quantity_kg or 0)

        y_val = r.year
        year_map[y_val] = year_map.get(y_val, 0.0) + float(r.quantity_kg or 0)

    by_crop = [{"crop": k, "yield_kg": v} for k, v in crop_map.items()]
    by_season = [{"season": k, "yield_kg": v} for k, v in season_map.items()]
    by_year = [{"year": str(k), "yield_kg": v} for k, v in sorted(year_map.items())]

    return YieldAnalyticsResponse(
        total_yield_kg=round(total_kg, 2),
        total_land_acres=round(total_acres, 2),
        by_crop=by_crop,
        by_season=by_season,
        by_year=by_year
    )
