import uuid
from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    full_name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)  # 'farmer', 'customer', 'admin'
    status = Column(String(20), nullable=False, default="active")  # 'active', 'blocked', 'pending'
    avatar_url = Column(Text, nullable=True)
    preferred_language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="FarmerProfile.user_id", lazy="selectin")
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
