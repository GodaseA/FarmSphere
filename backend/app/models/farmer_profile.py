import uuid
from sqlalchemy import Column, String, Text, Numeric, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    farm_name = Column(String(120), nullable=True)
    village = Column(String(100), nullable=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Numeric(9, 6), nullable=True)
    longitude = Column(Numeric(9, 6), nullable=True)
    land_size_acres = Column(Numeric(8, 2), nullable=False)
    id_proof_url = Column(Text, nullable=False)
    land_proof_url = Column(Text, nullable=True)
    verification_status = Column(String(20), nullable=False, default="pending")  # 'pending', 'approved', 'rejected'
    verified_by = Column(GUID, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    avg_rating = Column(Numeric(2, 1), default=0.0)
    rating_count = Column(Integer, default=0)

    user = relationship("User", back_populates="farmer_profile", foreign_keys=[user_id])
    yields = relationship("CropYield", back_populates="farmer", cascade="all, delete-orphan")
    listings = relationship("CropListing", back_populates="farmer", cascade="all, delete-orphan")
    predictions = relationship("DiseasePrediction", back_populates="farmer", cascade="all, delete-orphan")
