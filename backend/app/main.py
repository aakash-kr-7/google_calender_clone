from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, events

# Import models so SQLAlchemy registers them before create_all
from app.models import user, event  # noqa: F401

app = FastAPI(title="Google Calendar Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://google-calender-clone-vert.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(events.router, prefix="/events", tags=["events"])

@app.on_event("startup")
def startup():
    # Creates all tables if they don't exist yet.
    # In production, replace this with Alembic migrations.
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "running", "docs": "/docs"}
