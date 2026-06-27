from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # One user can own many events. cascade="all, delete-orphan" means
    # deleting a user also cleans up their events instead of leaving
    # orphaned rows with a dangling user_id.
    events = relationship("Event", back_populates="owner", cascade="all, delete-orphan")