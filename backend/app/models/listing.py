import uuid
from sqlalchemy import Column, String, Text, Numeric, Boolean, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, JSONType, generate_uuid_str


class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    farmer_id = Column(GUID, ForeignKey("farmer_profiles.user_id", ondelete="CASCADE"), nullable=False, index=True)
    crop_yield_id = Column(GUID, ForeignKey("crop_yields.id", ondelete="SET NULL"), nullable=True)
    crop_name = Column(String(80), nullable=False)
    description = Column(Text, nullable=True)
    price_per_kg = Column(Numeric(10, 2), nullable=False)
    quantity_available_kg = Column(Numeric(10, 2), nullable=False)
    min_order_kg = Column(Numeric(8, 2), default=1.0)
    quality_grade = Column(String(2), default="A")  # 'A', 'B', 'C'
    is_organic = Column(Boolean, default=False)
    image_urls = Column(JSONType, default=list)
    status = Column(String(20), nullable=False, default="active")  # 'active', 'paused', 'sold_out', 'removed'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    farmer = relationship("FarmerProfile", back_populates="listings")
    crop_yield = relationship("CropYield", back_populates="listings")
    cart_items = relationship("CartItem", back_populates="listing", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="listing")

    __table_args__ = (
        Index("idx_listing_crop", "crop_name", "status"),
        Index("idx_listing_farmer", "farmer_id"),
    )
