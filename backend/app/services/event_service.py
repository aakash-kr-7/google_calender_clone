from datetime import datetime
from sqlalchemy.orm import Session
from app.models.event import Event

def check_overlaps(
    db: Session,
    user_id: int,
    start_time: datetime,
    end_time: datetime,
    exclude_id: int | None = None
) -> list[Event]:
    """
    Find events for this user that overlap with the given time range.

    Two intervals [A_start, A_end) and [B_start, B_end) overlap when:
        A_start < B_end AND A_end > B_start

    We skip all-day events and recurring parent events (rrule IS NOT NULL)
    because they don't represent concrete blockable time slots.
    """
    query = db.query(Event).filter(
        Event.user_id == user_id,
        Event.is_all_day == False,
        Event.rrule == None,
        Event.start_time < end_time,
        Event.end_time > start_time,
    )
    if exclude_id:
        query = query.filter(Event.id != exclude_id)
    return query.all()


def get_events_in_range(
    db: Session,
    user_id: int,
    start: datetime,
    end: datetime
) -> list[Event]:
    """
    Fetch all events visible in the date range.
    
    Returns two groups:
    1. Regular events whose time falls within [start, end]
    2. Recurring parent events (rrule IS NOT NULL) — the frontend
       expands these into individual instances using the rrule library.
    """
    regular = db.query(Event).filter(
        Event.user_id == user_id,
        Event.rrule == None,
        Event.start_time >= start,
        Event.start_time <= end,
    ).all()

    recurring = db.query(Event).filter(
        Event.user_id == user_id,
        Event.rrule != None,
        Event.recurrence_id == None,  # only parents, not exception instances
    ).all()

    return regular + recurring
