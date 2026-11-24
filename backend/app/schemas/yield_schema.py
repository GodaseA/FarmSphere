from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class CropYieldCreate(BaseModel):
    crop_name: str
    season: str = Field(..., pattern="^(kharif|rabi|zaid)$")
    year: int
    sowing_date: date
    harvest_date: Optional[date] = None
    quantity_kg: Optional[float] = None
    land_area_acres: float = Field(..., gt=0)
    notes: Optional[str] = None


class CropYieldUpdate(BaseModel):
    crop_name: Optional[str] = None
    season: Optional[str] = None
    year: Optional[int] = None
    sowing_date: Optional[date] = None
    harvest_date: Optional[date] = None
    quantity_kg: Optional[float] = None
    land_area_acres: Optional[float] = None
    notes: Optional[str] = None


class CropYieldResponse(BaseModel):
    id: str
    farmer_id: str
    crop_name: str
    season: str
    year: int
    sowing_date: date
    harvest_date: Optional[date] = None
    quantity_kg: Optional[float] = None
    land_area_acres: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class YieldAnalyticsResponse(BaseModel):
    total_yield_kg: float
    total_land_acres: float
    by_crop: List[Dict[str, Any]]
    by_season: List[Dict[str, Any]]
    by_year: List[Dict[str, Any]]
