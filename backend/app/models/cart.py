import uuid
from sqlalchemy import Column, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class Cart(Base):
    __tablename__ = "carts"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    customer_id = Column(GUID, ForeignKey("customer_profiles.user_id", ondelete="CASCADE"), unique=True, nullable=False)

    customer = relationship("CustomerProfile", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    cart_id = Column(GUID, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(GUID, ForeignKey("crop_listings.id", ondelete="CASCADE"), nullable=False)
    quantity_kg = Column(Numeric(8, 2), nullable=False)

    cart = relationship("Cart", back_populates="items")
    listing = relationship("CropListing", back_populates="cart_items")

    __table_args__ = (
        UniqueConstraint("cart_id", "listing_id", name="uq_cart_listing"),
    )
