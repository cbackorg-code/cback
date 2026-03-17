from fastapi import APIRouter, Depends
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_session
from app.models import Feedback, FeedbackType, FeedbackStatus, Profile
from app.auth import get_current_profile

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackCreate(BaseModel):
    type: FeedbackType
    message: str
    user_id: Optional[str] = None # Or UUID

@router.post("")
def submit_feedback(
    feedback_in: FeedbackCreate,
    session: Session = Depends(get_session),
    profile: Profile = Depends(get_current_profile)
):
    feedback = Feedback(
        type=feedback_in.type,
        message=feedback_in.message,
        user_id=str(profile.id)
    )
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return {"message": "Feedback submitted successfully", "id": feedback.id}
