# Google Calendar Clone (gcal-clone)

A full-stack, pixel-perfect Google Calendar clone. This application supports user authentication (including Google OAuth), responsive day/week/month views, event dragging, event resizing, recurrence rules parsing, scheduling overlap conflict detections, and power-user workflows.

🚀 **Live Hosted Demo**: [https://google-calender-clone-vert.vercel.app](https://google-calender-clone-vert.vercel.app)

---

## Architecture & Data Flow Diagram (a more detailed version for review is in /docs/detailed_architecture_diagram.png)

```mermaid
flowchart LR

%% =========================
%% Client
%% =========================
subgraph CLIENT["Frontend (React + Zustand)"]
    U[User]
    UI[Calendar UI]
    CMD[Command Palette]
    PREV[Hover Preview]
    STORE[Zustand State]

    U --> UI
    UI --> CMD
    UI --> PREV
    UI <--> STORE
end

%% =========================
%% Backend
%% =========================
subgraph SERVER["Backend (FastAPI)"]
    API[REST API]

    AUTH[Authentication]
    EVENTS[Events Router]
    SERVICE[Event Service]
    JWT[JWT Validation]

    API --> JWT
    JWT --> AUTH
    API --> EVENTS
    EVENTS --> SERVICE
end

%% =========================
%% Database
%% =========================
subgraph DATABASE["SQLite"]
    DB[(calendar.db)]

    USERS[Users]
    EVENTS_DB[Events]

    DB --> USERS
    DB --> EVENTS_DB
end

%% =========================
%% Connections
%% =========================
STORE -->|JWT Requests| API

AUTH --> USERS
SERVICE --> EVENTS_DB

SERVICE -->|Conflict Detection| EVENTS_DB
SERVICE -->|Create / Update / Delete| EVENTS_DB

EVENTS_DB --> SERVICE
USERS --> AUTH

SERVICE --> API
API --> STORE
```

---

## Tech Stack & Architecture Decisions

### Backend

- **Framework**: **FastAPI**
  - _Why_: Provides high performance, automatic OpenAPI (Swagger) documentation, and native asynchronous support, making it perfect for rapid calendar scheduling operations.
- **ORM**: **SQLAlchemy 2.0**
  - _Why_: Modernized Python database engine offering robust transaction management, query relationships mapping, and clean data modeling syntax.
- **Database**: **SQLite**
  - _Why_: Lightweight, single-file database that simplifies local configuration and runs cross-platform without external database daemon dependencies.
- **Authentication**: **JWT (JSON Web Tokens)** + **Google OAuth Integration**
  - _Why_: Allows secure, stateless user sessions matching modern SPA standards, alongside frictionless authentication using the user's Google account credentials.

### Frontend

- **Framework**: **React 18** (bootstrapped via **Vite**)
  - _Why_: Vite provides near-instantaneous hot module reloading (HMR) and ultra-fast production builds. React offers component reusability and clean state bindings.
- **Styling**: **Tailwind CSS**
  - _Why_: Utility-first styling classes that allow us to replicate the official Google Calendar theme, fonts, borders, and margins with maximum fidelity, including dark mode support.
- **State Management**: **Zustand**
  - _Why_: Simple, boilerplate-free state store that provides clean getter/setter actions, avoiding the overhead of heavy Redux setups.
- **Date Utilities**: **date-fns** & **rrule**
  - _Why_: `date-fns` provides lightweight, immutable helper functions for calendars. The `rrule` library translates RFC-compliant recurrence strings into individual event occurrences on the frontend.
- **Drag-and-Drop**: **@dnd-kit**
  - _Why_: Modular, accessibility-friendly drag-and-drop library for React that supports pointer offsets and custom constraints.

---

## Business Logic & Edge Cases

### 1. Timezone Normalization

To prevent scheduling offsets across clients:

- The backend accepts and normalizes all incoming datetimes to naive UTC.
- The frontend converts UTC ISO strings received from the API into local JS `Date` objects, aligning event displays automatically with the browser's local timezone.

### 2. Overlap Conflict Detection

- When creating or modifying an event (excluding all-day and recurring parent events), the backend calculates overlapping intervals using:
  `A_start < B_end AND A_end > B_start`
- If an overlap exists, the API rejects the request with a `409 Conflict` containing the conflicting events list.
- **Conflict Handling suggestions**: If an overlap is encountered, the scheduling assistant calculates the next 3 available non-overlapping time slots of the same duration within working hours (9:00 AM – 6:00 PM) for the currently visible week. These recommendations are displayed in the toast warning and the creation modal. The user can either click a suggestion to pre-fill it or click "Save anyway" to override.

### 3. Drag-and-Drop Activation Threshold

- Moving blocks uses `dnd-kit` coordinates to compute vertical delta pixels, which are mapped to 15-minute time intervals.
- To prevent accidental event movement during simple clicks, we use `useSensors` with a `PointerSensor` configured to a **8px activation distance constraint**.

---

## Implementation of Animations & Interactions

- **Spring-Scale Modal Entrances**: The event modal mounts using a custom keyframe scale transition combined with a physics-inspired spring cubic-bezier easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Drag drop release glide**: On releasing an event drag, the `transform` smoothly transitions back to `0` with a `200ms` spring transition, preventing visual jumps.
- **Active Current Time Pulse**: The current-time indicator line moves using transitions on its CSS `top` coordinate. The red indicator circle pulses dynamically (`animate-time-pulse` keyframe) to create a sense of presence.
- **Hover Previews & Scale Elevation**: Event blocks scale by `1.025` and animate their z-index on hover. Simultaneously, a lightweight event preview card (`EventHoverPreview.jsx`) fades in after a `150ms` delay to show description, location, time, and guests.
- **Skeleton Shimmer Loading**: Loading states display calendar skeleton layouts containing shimmer animations, mimicking actual columns and month grids to decrease perceived loading latency.
- **Undo Delete Toast**: Deleting an event triggers a custom toast notification with a 5-second timer. If "Undo" is clicked, it restores the deleted event by sending the cached data back to the server.
- **Empty Slot Double-Click**: Double-clicking on any empty cell in the Day, Week, or Month view instantly triggers the creation modal pre-filled with the exact day and time coordinates clicked.

---

## Installation & Running Locally

Follow these steps to run the complete project on your local machine:

### Prerequisites

- Python 3.10+
- Node.js 18+

### Step 1: Run the Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a clean virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (CMD/PowerShell)**:
     ```bash
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
6. Run database migrations:
   ```bash
   python migrate.py
   ```
7. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will run on [http://localhost:8000](http://localhost:8000). You can verify it by opening the Swagger docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Step 2: Run the Frontend UI

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install node modules:
   ```bash
   npm install
   ```
3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will boot up at [http://localhost:5173](http://localhost:5173). Open this address in your browser, register an account, and begin scheduling!

---

## Database Migrations

If you are upgrading an existing database, run the migration script in the backend folder to add the new `attendees` column to your events table:

```bash
cd backend
python migrate.py
```

Alternatively, you can delete the `backend/calendar.db` file, and a fresh database with the updated columns will be initialized automatically on the next server startup.

---

## Deployed Application & Setup Guide

This application is deployed and running live on the cloud.

- **Frontend UI**: [https://google-calender-clone-vert.vercel.app](https://google-calender-clone-vert.vercel.app) (Hosted on Vercel)
- **Backend API**: Hosted on Render (Web Service)

### Deployment Architecture & Configuration

#### 1. Backend Web Service (Render)

The backend API is hosted on Render as a Python Web Service linked directly to the main branch of this repository:

- **Build Settings**:
  - **Root Directory**: `backend`
  - **Runtime**: `Python`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: `sqlite:///./calendar.db` (initializes and persists the SQLite database file)

#### 2. Frontend SPA Client (Vercel)

The React + Vite client is hosted on Vercel:

- **Build Settings**:
  - **Root Directory**: `frontend`
  - **Framework Preset**: `Vite`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Points to the live Render backend API URL to route requests successfully.
  - `VITE_GOOGLE_CLIENT_ID`: Preconfigured Google OAuth Client ID for sign-in functionality.

---

## Future Enhancements

1. **Collaboration Features**: Add shared calendars, real-time sync via WebSockets, and calendar invitation emails.
2. **Notification Delivery**: Set up email or browser push notifications before events start.
3. **Full Recurring Exceptions**: Complete exceptions management (editing "this and all following events") to match enterprise standards.

---

## Theory Questions

### Imagine your calendar application now serves one million users. How would you redesign the backend to efficiently retrieve events, support recurring events, and prevent inconsistencies when multiple devices edit the same event?

1. **Efficient Event Retrieval**:
   - **Database Sharding**: Shard the SQL database horizontally by `user_id`. Since all event retrievals and mutations are scoped to individual users, queries will run in parallel against specific shards, preventing database bottlenecking.
   - **Caching Layer (Redis)**: Introduce Redis caching to store query ranges (e.g., active month/week) for each user. Using Sorted Sets (ZSET) with event start/end times as scores allows high-speed range queries without touching the main database.
   - **Read-Write Separation**: Set up database replication with primary-replica architecture. Direct writes to primary nodes and route queries to read-replicas.
2. **Recurring Event Support at Scale**:
   - Avoid expanding recurrence rules to static rows in the database, which bloats storage. Instead, store only the **Parent Recurrence Template** (with the `rrule` rule string) and **Override Exception Rows** (exceptions).
   - Perform recurrence expansions in-memory at the application server layer on GET requests using high-performance C-extensions/Rust routines, or pre-expand and cache occurrences in Redis only for the immediate 3 months ahead.
3. **Preventing Inconsistencies (Concurrency Control)**:
   - **Optimistic Locking**: Add a `version` (or `updated_at` timestamp) column to the `events` table. When updating an event, verify the version matches: `UPDATE events SET title = :new_title, version = version + 1 WHERE id = :id AND version = :old_version`. If a write conflict occurs (version mismatch), reject the change and prompt the user to resolve the conflict.
   - **Distributed Locks**: Use Redis distributed locks (Redlock) during mutations on a single event ID to prevent race conditions during rapid concurrent edits from multiple client sessions.

### Your calendar becomes slow when rendering thousands of events. What frontend optimization techniques would you apply to improve performance, and why would each technique help?

1. **Windowing / Virtual Scroll (e.g., Virtualized Grids)**:
   - _Why it helps_: Rendering thousands of calendar DOM elements degrades layout calculations and scrolling frame rates. Virtualization ensures that only events currently present inside the scroll viewport (plus a small buffer) are actually mounted in the DOM. This reduces active DOM nodes from thousands to under 100, maintaining constant rendering speed.
2. **Event Debouncing & Throttling**:
   - _Why it helps_: Throttling pointer movements during drag-and-drop or resize interactions limits reflow computations to 60 frames per second. It prevents the browser from executing heavy coordinate calculation callbacks on every single pixel movement.
3. **React Memoization (`React.memo`, `useMemo`, `useCallback`)**:
   - _Why it helps_: Prevents redundant React re-render cycles. By memoizing `EventBlock` items and day columns, React bypasses layout re-generation unless event properties or screen coordinates actually change.
4. **CSS Transforms & Composite Acceleration**:
   - _Why it helps_: Animate dragging blocks using `transform: translate3d(x, y, 0)` instead of modifying standard layout properties like `top`/`left`. This offloads layout translation to the GPU composite layer, bypassing expensive browser document reflows.
5. **Web Workers for Recurrence Rule Expansion**:
   - _Why it helps_: Expansions of complex `rrules` over long periods (like expanding hundreds of recurring events for a month grid view) are CPU-intensive. Offloading these computations to a background Web Worker keeps the main UI thread unblocked, ensuring smooth interaction feedback.
