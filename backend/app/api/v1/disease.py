from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_db
from app.core.deps import require_role
from app.models.user import User
from app.schemas.disease import DiseasePredictionOut
from app.services.disease_service import predict_disease_and_record, get_farmer_predictions

router = APIRouter(prefix="/disease", tags=["Disease Diagnostic"])


@router.post("/predict", response_model=DiseasePredictionOut)
async def predict_leaf_disease(
    image: UploadFile = File(...),
    crop_yield_id: Optional[str] = Form(None),
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    image_bytes = await image.read()
    return await predict_disease_and_record(
        db=db,
        farmer_id=str(current_user.id),
        file_bytes=image_bytes,
        crop_yield_id=crop_yield_id
    )


@router.get("/history", response_model=List[DiseasePredictionOut])
async def prediction_history(
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db)
):
    return await get_farmer_predictions(db, str(current_user.id))
