from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(500), nullable=True)
    start_time = Column(DateTime, nullable=False)  # always stored as UTC
    end_time = Column(DateTime, nullable=False)    # always stored as UTC
    color = Column(String(20), default="#1a73e8")
    is_all_day = Column(Boolean, default=False)
    
    # rrule stores the recurrence rule string e.g. "FREQ=WEEKLY;BYDAY=MO,WE"
    # If null, this is a one-time event.
    rrule = Column(String(500), nullable=True)
    
    # recurrence_id points to the parent recurring event.
    # When a user edits "only this instance" of a recurring event,
    # we create a new Event row with recurrence_id = parent.id
    # so we know this row overrides a specific occurrence.
    recurrence_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    attendees = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="events", foreign_keys=[user_id])
    exceptions = relationship("Event", foreign_keys=[recurrence_id])
