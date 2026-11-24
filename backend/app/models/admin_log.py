from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.types import GUID


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    action_type = Column(String(60), nullable=False)
    target_type = Column(String(40), nullable=True)
    target_id = Column(GUID, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    actor = relationship("User", foreign_keys=[actor_id])

    __table_args__ = (
        Index("idx_log_target", "target_type", "target_id"),
    )
