import sqlite3
import os

def run_migration():
    db_path = os.path.join(os.path.dirname(__file__), "calendar.db")
    if os.path.exists(db_path):
        print(f"Database found at {db_path}. Running migrations...")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("ALTER TABLE events ADD COLUMN attendees TEXT")
            conn.commit()
            conn.close()
            print("Successfully migrated database: added 'attendees' column to 'events' table.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column 'attendees' already exists. Database is up to date.")
            else:
                print(f"Operational error during migration: {e}")
        except Exception as e:
            print(f"Error during migration: {e}")
    else:
        print("Database not found. A fresh database will be created automatically on server startup.")

if __name__ == "__main__":
    run_migration()
