import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, JSONType, generate_uuid_str


class DiseaseTreatment(Base):
    __tablename__ = "disease_treatments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    class_name = Column(String(120), unique=True, nullable=False, index=True)
    crop = Column(String(60), nullable=False)
    disease_name = Column(String(120), nullable=False)
    is_healthy = Column(Boolean, default=False, nullable=False)
    chemical_treatment = Column(Text, nullable=True)
    organic_treatment = Column(Text, nullable=True)
    dosage = Column(Text, nullable=True)
    prevention_tips = Column(Text, nullable=True)

    predictions = relationship("DiseasePrediction", back_populates="treatment")


class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    farmer_id = Column(GUID, ForeignKey("farmer_profiles.user_id", ondelete="CASCADE"), nullable=False, index=True)
    crop_yield_id = Column(GUID, ForeignKey("crop_yields.id", ondelete="SET NULL"), nullable=True)
    image_url = Column(Text, nullable=False)
    predicted_class = Column(String(120), nullable=False)
    confidence = Column(Numeric(5, 4), nullable=False)
    is_uncertain = Column(Boolean, default=False, nullable=False)
    top3 = Column(JSONType, nullable=True)  # List of {class, confidence}
    treatment_id = Column(Integer, ForeignKey("disease_treatments.id"), nullable=True)
    model_version = Column(String(30), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    farmer = relationship("FarmerProfile", back_populates="predictions")
    crop_yield = relationship("CropYield", back_populates="predictions")
    treatment = relationship("DiseaseTreatment", back_populates="predictions")

    __table_args__ = (
        Index("idx_pred_farmer", "farmer_id", "created_at"),
        Index("idx_pred_region", "state", "district", "predicted_class"),
    )
