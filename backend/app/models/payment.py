import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class Payment(Base):
    __tablename__ = "payments"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    method = Column(String(20), nullable=False)  # 'online', 'cod'
    status = Column(String(20), nullable=False, default="initiated")  # 'initiated', 'paid', 'failed', 'refunded'
    amount = Column(Numeric(12, 2), nullable=False)
    gateway_order_id = Column(String(80), nullable=True)
    gateway_payment_id = Column(String(80), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    order = relationship("Order", back_populates="payment")
