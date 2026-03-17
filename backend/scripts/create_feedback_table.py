import sys
import os
from sqlmodel import SQLModel
from sqlalchemy import text

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from app.models import Feedback

def create_feedback_table():
    print("Creating 'feedbacks' table...")
    # This will create all tables defined in SQLModel metadata that don't exist yet
    # Which in this case includes our new Feedback table
    Feedback.metadata.create_all(engine, tables=[Feedback.__table__])
    print("Table created successfully!")

if __name__ == "__main__":
    create_feedback_table()
