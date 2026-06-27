from datetime import datetime, timezone

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def to_utc(dt: datetime) -> datetime:
    # If the datetime has timezone info, convert to UTC.
    # If it's naive (no tzinfo), assume it's already UTC.
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

def ensure_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt
