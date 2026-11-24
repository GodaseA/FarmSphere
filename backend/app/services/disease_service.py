from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from starlette.concurrency import run_in_threadpool
from fastapi import UploadFile, HTTPException, status
from typing import Optional, List
import uuid

from app.ml.predictor import predict as ml_predict
from app.models.disease import DiseaseTreatment, DiseasePrediction
from app.models.farmer_profile import FarmerProfile
from app.schemas.disease import DiseasePredictionOut, TreatmentDetail
from app.services.storage_service import save_image_bytes


async def predict_disease_and_record(
    db: AsyncSession,
    farmer_id: str,
    file_bytes: bytes,
    crop_yield_id: Optional[str] = None
) -> DiseasePredictionOut:
    # 1. Fetch farmer location for regional disease hotspots analytics
    f_query = select(FarmerProfile).where(FarmerProfile.user_id == farmer_id)
    farmer_prof = (await db.execute(f_query)).scalar_one_or_none()
    district = farmer_prof.district if farmer_prof else None
    state = farmer_prof.state if farmer_prof else None

    # 2. Save image
    image_url = save_image_bytes(file_bytes, "leaf_scan.jpg")

    # 3. Run inference in threadpool so event loop is never blocked
    pred_res = await run_in_threadpool(ml_predict, file_bytes)

    # 4. Lookup treatment in disease_treatments table
    t_query = select(DiseaseTreatment).where(DiseaseTreatment.class_name == pred_res.predicted_class)
    treatment_record = (await db.execute(t_query)).scalar_one_or_none()

    treatment_id = treatment_record.id if treatment_record else None
    treatment_detail = None
    if treatment_record:
        treatment_detail = TreatmentDetail(
            chemical=treatment_record.chemical_treatment,
            organic=treatment_record.organic_treatment,
            dosage=treatment_record.dosage,
            prevention=treatment_record.prevention_tips
        )

    # 5. Save row in disease_predictions
    prediction_row = DiseasePrediction(
        farmer_id=farmer_id,
        crop_yield_id=crop_yield_id,
        image_url=image_url,
        predicted_class=pred_res.predicted_class,
        confidence=pred_res.confidence,
        is_uncertain=pred_res.is_uncertain,
        top3=[{"class": t.class_name, "confidence": t.confidence} for t in pred_res.top3],
        treatment_id=treatment_id,
        model_version=pred_res.model_version,
        district=district,
        state=state
    )
    db.add(prediction_row)
    await db.commit()
    await db.refresh(prediction_row)

    return DiseasePredictionOut(
        id=str(prediction_row.id),
        farmer_id=farmer_id,
        crop_yield_id=crop_yield_id,
        image_url=image_url,
        predicted_class=pred_res.predicted_class,
        confidence=float(pred_res.confidence),
        is_uncertain=pred_res.is_uncertain,
        top3=[{"class": t.class_name, "confidence": t.confidence} for t in pred_res.top3],
        treatment=treatment_detail,
        model_version=pred_res.model_version,
        district=district,
        state=state,
        created_at=prediction_row.created_at
    )


async def get_farmer_predictions(db: AsyncSession, farmer_id: str) -> List[DiseasePredictionOut]:
    query = select(DiseasePrediction).where(DiseasePrediction.farmer_id == farmer_id).order_by(DiseasePrediction.created_at.desc())
    records = (await db.execute(query)).scalars().all()

    results = []
    for r in records:
        t_detail = None
        if r.treatment_id:
            t_rec = (await db.execute(select(DiseaseTreatment).where(DiseaseTreatment.id == r.treatment_id))).scalar_one_or_none()
            if t_rec:
                t_detail = TreatmentDetail(
                    chemical=t_rec.chemical_treatment,
                    organic=t_rec.organic_treatment,
                    dosage=t_rec.dosage,
                    prevention=t_rec.prevention_tips
                )

        results.append(
            DiseasePredictionOut(
                id=str(r.id),
                farmer_id=r.farmer_id,
                crop_yield_id=r.crop_yield_id,
                image_url=r.image_url,
                predicted_class=r.predicted_class,
                confidence=float(r.confidence),
                is_uncertain=r.is_uncertain,
                top3=r.top3 or [],
                treatment=t_detail,
                model_version=r.model_version,
                district=r.district,
                state=r.state,
                created_at=r.created_at
            )
        )
    return results
