import uuid
from sqlalchemy import Column, String, Text, Numeric, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class Order(Base):
    __tablename__ = "orders"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    order_no = Column(String(20), unique=True, nullable=False, index=True)
    customer_id = Column(GUID, ForeignKey("customer_profiles.user_id"), nullable=False)
    farmer_id = Column(GUID, ForeignKey("farmer_profiles.user_id"), nullable=False)
    fulfilment = Column(String(20), nullable=False)  # 'delivery', 'pickup'
    delivery_address = Column(Text, nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # 'pending','confirmed','shipped','delivered','cancelled','rejected'
    placed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    review = relationship("Review", back_populates="order", uselist=False, cascade="all, delete-orphan")
    disputes = relationship("Dispute", back_populates="order")

    customer = relationship("CustomerProfile", foreign_keys=[customer_id])
    farmer = relationship("FarmerProfile", foreign_keys=[farmer_id])

    __table_args__ = (
        Index("idx_order_customer", "customer_id", "placed_at"),
        Index("idx_order_farmer", "farmer_id", "status"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(GUID, ForeignKey("crop_listings.id"), nullable=True)
    crop_name = Column(String(80), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity_kg = Column(Numeric(8, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    listing = relationship("CropListing", back_populates="order_items")
