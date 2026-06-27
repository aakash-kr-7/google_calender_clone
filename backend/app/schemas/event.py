from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from typing import Optional

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime
    color: str = "#1a73e8"
    is_all_day: bool = False
    rrule: Optional[str] = None

    @field_validator("end_time")
    @classmethod
    def end_must_be_after_start(cls, end_time, info):
        if "start_time" in info.data and end_time <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return end_time

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: Optional[str] = None
    is_all_day: Optional[bool] = None
    rrule: Optional[str] = None

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    title: str
    description: Optional[str]
    location: Optional[str]
    start_time: datetime
    end_time: datetime
    color: str
    is_all_day: bool
    rrule: Optional[str]
    recurrence_id: Optional[int]
    created_at: datetime
    updated_at: datetime

class OverlapResponse(BaseModel):
    conflict: bool = True
    overlapping_events: list[EventResponse]
    message: str
