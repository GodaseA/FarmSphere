import uuid
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=False, index=True)
    raised_by = Column(GUID, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="open")  # 'open', 'in_review', 'resolved', 'rejected'
    resolution_note = Column(Text, nullable=True)
    resolved_by = Column(GUID, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    order = relationship("Order", back_populates="disputes")
    user = relationship("User", foreign_keys=[raised_by])
    resolver = relationship("User", foreign_keys=[resolved_by])
