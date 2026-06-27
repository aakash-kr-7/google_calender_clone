# Google Calendar Clone (gcal-clone)

A full-stack Google Calendar clone project featuring a FastAPI backend powered by SQLAlchemy and SQLite, and a structured frontend.

---

## Project Structure

The project has been cleaned and set up with the following directory structure:

```text
gcal-clone/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── event.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── event.py
│   │   │   └── user.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── events.py
│   │   │   └── auth.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── event_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── timezone.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        └── .gitkeep
```

---

## Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (v0.111.0)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) (v0.29.0)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) (v2.0.30)
- **Database**: SQLite (local `calendar.db`)
- **Authentication**: JWT token-based (`python-jose`, `passlib[bcrypt]`)
- **Validation**: [Pydantic](https://docs.pydantic.dev/) (v2.7.1)

### Frontend
- **Structure**: Preconfigured with `public/index.html` and a Git placeholder directory `src/.gitkeep`.

---

## Setup and Installation

Follow these steps to run the backend API server locally:

### 1. Configure the Backend
Navigate to the `backend/` directory:
```bash
cd backend
```

Create a Python virtual environment and activate it:
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows (PowerShell)
Copy-Item -Path .env.example -Destination .env

# macOS/Linux/Git Bash
cp .env.example .env
```

Review and adjust `.env` variables if necessary:
```env
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./calendar.db
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### 3. Run the Server
Launch the Uvicorn ASGI server:
```bash
uvicorn app.main:app --reload --port 8000
```

The database (`calendar.db`) will be automatically created on application startup, initializing all schemas.

---

## Verification & API Endpoints

Once the server is running, you can access the following endpoints:

- **Root API Status**: [http://localhost:8000/](http://localhost:8000/)
- **Interactive OpenAPI documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

### API Endpoints Implemented
- **Authentication (`/auth`)**:
  - `POST /auth/register` - Register a new user
  - `POST /auth/login` - Authenticate and obtain JWT token
  - `GET /auth/me` - Get current authenticated user details
- **Events (`/events`)**:
  - `GET /events` - List events within a given datetime range (`start` and `end`)
  - `POST /events` - Create a new event (includes automatic overlap checks unless `force=true` query param is provided)
  - `PATCH /events/{event_id}` - Update details of an existing event
  - `DELETE /events/{event_id}` - Delete an event
  - `POST /events/{event_id}/exceptions` - Create an exception instance for a recurring event
