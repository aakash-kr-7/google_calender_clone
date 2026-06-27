from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventResponse, OverlapResponse
from app.services.event_service import check_overlaps, get_events_in_range
from app.routers.auth import get_current_user
from app.models.user import User
from app.utils.timezone import to_utc

router = APIRouter()


@router.get("", response_model=list[EventResponse])
def list_events(
    start: datetime = Query(...),
    end: datetime = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_events_in_range(db, current_user.id, to_utc(start), to_utc(end))


@router.post("", response_model=EventResponse, status_code=201)
def create_event(
    event_data: EventCreate,
    force: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start = to_utc(event_data.start_time)
    end = to_utc(event_data.end_time)

    # Check for overlaps unless user explicitly said force=true (save anyway)
    if not force and not event_data.is_all_day and not event_data.rrule:
        overlaps = check_overlaps(db, current_user.id, start, end)
        if overlaps:
            from app.schemas.event import EventResponse as ER
            raise HTTPException(
                status_code=409,
                detail=OverlapResponse(
                    conflict=True,
                    overlapping_events=[ER.model_validate(e) for e in overlaps],
                    message=f"This event overlaps with {len(overlaps)} existing event(s)",
                ).model_dump(mode="json"),
            )

    event = Event(
        user_id=current_user.id,
        title=event_data.title,
        description=event_data.description,
        location=event_data.location,
        start_time=start,
        end_time=end,
        color=event_data.color,
        is_all_day=event_data.is_all_day,
        rrule=event_data.rrule,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    force: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    updates = event_data.model_dump(exclude_unset=True)
    
    if "start_time" in updates:
        updates["start_time"] = to_utc(updates["start_time"])
    if "end_time" in updates:
        updates["end_time"] = to_utc(updates["end_time"])

    new_start = updates.get("start_time", event.start_time)
    new_end = updates.get("end_time", event.end_time)

    if not force and not event.is_all_day and not event.rrule:
        overlaps = check_overlaps(db, current_user.id, new_start, new_end, exclude_id=event_id)
        if overlaps:
            from app.schemas.event import EventResponse as ER
            raise HTTPException(
                status_code=409,
                detail=OverlapResponse(
                    conflict=True,
                    overlapping_events=[ER.model_validate(e) for e in overlaps],
                    message=f"This event overlaps with {len(overlaps)} existing event(s)",
                ).model_dump(mode="json"),
            )

    for key, value in updates.items():
        setattr(event, key, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}


@router.post("/{event_id}/exceptions", response_model=EventResponse, status_code=201)
def create_exception(
    event_id: int,
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parent = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent event not found")

    exception = Event(
        user_id=current_user.id,
        recurrence_id=event_id,
        title=event_data.title,
        description=event_data.description,
        location=event_data.location,
        start_time=to_utc(event_data.start_time),
        end_time=to_utc(event_data.end_time),
        color=event_data.color,
        is_all_day=event_data.is_all_day,
        rrule=None,
    )
    db.add(exception)
    db.commit()
    db.refresh(exception)
    return exception
