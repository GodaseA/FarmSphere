import uuid
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID, generate_uuid_str


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID, primary_key=True, default=generate_uuid_str)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    audience = Column(String(10), default="user")  # 'user', 'farmers', 'customers', 'all'
    title = Column(String(160), nullable=False)
    body = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User")

    __table_args__ = (
        Index("idx_notif_user", "user_id", "is_read"),
    )
