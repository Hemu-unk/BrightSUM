import os
from sqlmodel import SQLModel, create_engine, Session

DB_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Create the SQLAlchemy engine for connecting to the database
# create app.db if it doesn't already exist
engine = create_engine(
    DB_URL,
    echo=True,
    connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {}
)

def get_session():
    with Session(engine) as s:
        yield s

# Initializes the database on startup
def init_db():
    # Ensure models are imported so tables are registered
    from . import models  
    SQLModel.metadata.create_all(engine) # Create tables if they don't exist already
    # For SQLite, ALTER TABLE to add new columns that may have been added to models
    # after the DB file was created. This helps during development to keep the
    # schema in sync for additive changes like adding new nullable columns.
    if DB_URL.startswith("sqlite"):
        try:
            conn = engine.raw_connection()
            cur = conn.cursor()
            cur.execute("PRAGMA table_info('quizattemptquestion')")
            existing = [r[1] for r in cur.fetchall()]
            # columns we expect to exist on QuizAttemptQuestion
            expected = [
                ("is_correct", "BOOLEAN"),
                ("given_answer", "TEXT"),
                ("time_seconds", "REAL"),
                ("hints_requested", "INTEGER"),
            ]
            for cname, ctype in expected:
                if cname not in existing:
                    cur.execute(f"ALTER TABLE quizattemptquestion ADD COLUMN {cname} {ctype}")
            conn.commit()
        except Exception:
            # Non-fatal in dev: ignore migration errors here and let user run manual migration
            try:
                conn.rollback()
            except Exception:
                pass
        finally:
            try:
                cur.close()
                conn.close()
            except Exception:
                pass
