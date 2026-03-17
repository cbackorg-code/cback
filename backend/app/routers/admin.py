from fastapi import APIRouter
from app.database import engine
from sqlmodel import SQLModel

# Explicitly import models so SQLModel registers them
from app.models import Feedback

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/migrate")
def run_migrations():
    """
    Creates any missing tables in the database.
    Safe to run multiple times (create_all ignores existing tables).
    """
    try:
        SQLModel.metadata.create_all(engine)
        return {"message": "Database tables created successfully."}
    except Exception as e:
        return {"error": str(e)}
