from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    address_line = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)

    user = relationship("User", back_populates="customer_profile")
    cart = relationship("Cart", back_populates="customer", uselist=False, cascade="all, delete-orphan")
