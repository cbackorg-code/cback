import os
from sqlmodel import SQLModel, create_engine, Session

# Use DATABASE_URL env var if available, otherwise default to local sqlite
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./backend_app.db")

# For SQLite, we need connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

print(f"DATABASE_URL: {DATABASE_URL[:60]}...")
print(f"Using {'SQLite' if 'sqlite' in DATABASE_URL else 'PostgreSQL'}")

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
