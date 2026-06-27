import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./calendar.db")

# SQLite only allows a single thread to use a connection by default. FastAPI's
# dependency-injection model can hand the same engine to different request
# handlers, which under the hood get serviced on different threads by
# uvicorn's worker pool. Without check_same_thread=False, SQLite raises
# "SQLite objects created in a thread can only be used in that same thread",
# even though SQLAlchemy guarantees the *session* itself is only ever used
# sequentially within a single request.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session for the duration of a
    single request, and guarantees it's closed afterwards (even if the
    request raises an exception) via the try/finally block.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()