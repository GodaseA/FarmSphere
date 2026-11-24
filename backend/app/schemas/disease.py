from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class TreatmentDetail(BaseModel):
    chemical: Optional[str] = None
    organic: Optional[str] = None
    dosage: Optional[str] = None
    prevention: Optional[str] = None


class DiseaseTreatmentOut(BaseModel):
    id: int
    class_name: str
    crop: str
    disease_name: str
    is_healthy: bool
    chemical_treatment: Optional[str] = None
    organic_treatment: Optional[str] = None
    dosage: Optional[str] = None
    prevention_tips: Optional[str] = None

    class Config:
        from_attributes = True


class DiseasePredictionOut(BaseModel):
    id: str
    farmer_id: Optional[str] = None
    crop_yield_id: Optional[str] = None
    image_url: str
    predicted_class: str
    confidence: float
    is_uncertain: bool
    top3: List[Dict[str, Any]]
    treatment: Optional[TreatmentDetail] = None
    model_version: str
    district: Optional[str] = None
    state: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
