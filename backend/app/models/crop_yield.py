import uuid
from sqlalchemy import Column, String, Numeric, Integer, Date, Text, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class CropYield(Base):
    __tablename__ = "crop_yields"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    farmer_id = Column(GUID, ForeignKey("farmer_profiles.user_id", ondelete="CASCADE"), nullable=False, index=True)
    crop_name = Column(String(80), nullable=False)
    season = Column(String(20), nullable=False)  # 'kharif', 'rabi', 'zaid'
    year = Column(Integer, nullable=False)
    sowing_date = Column(Date, nullable=False)
    harvest_date = Column(Date, nullable=True)
    quantity_kg = Column(Numeric(10, 2), nullable=True)
    land_area_acres = Column(Numeric(8, 2), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    farmer = relationship("FarmerProfile", back_populates="yields")
    predictions = relationship("DiseasePrediction", back_populates="crop_yield")
    listings = relationship("CropListing", back_populates="crop_yield")

    __table_args__ = (
        Index("idx_yield_farmer_year", "farmer_id", "year"),
    )
