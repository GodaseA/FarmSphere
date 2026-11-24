import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, DateTime, func, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class Review(Base):
    __tablename__ = "reviews"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    customer_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    is_hidden = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    order = relationship("Order", back_populates="review")
    customer = relationship("User", foreign_keys=[customer_id])
    farmer = relationship("User", foreign_keys=[farmer_id])

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_1_to_5"),
    )
