import os
from sqlmodel import SQLModel, create_engine, Session

# Use DATABASE_URL env var if available, otherwise default to local sqlite
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./backend_app.db")

# Cloudflare Workers Python requires pure-python driver (pg8000)
# But for Render/Docker, we want standard psycopg2 (which handles postgresql://)
# So we removed the forcing of pg8000 here.

# For SQLite, we need connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

print(f"DATABASE_URL: {DATABASE_URL[:60]}...")
print(f"Using {'SQLite' if 'sqlite' in DATABASE_URL else 'PostgreSQL'}")

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Enable WAL mode for SQLite for better concurrency
if "sqlite" in DATABASE_URL:
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
