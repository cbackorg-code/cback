from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid
from datetime import datetime

from app.database import get_session
from app.models import EntryComment, Profile
from app.auth import get_current_profile

router = APIRouter(
    prefix="/comments",
    tags=["comments"],
)

# Get comments for an entry
@router.get("/entry/{entry_id}")
def get_entry_comments(
    entry_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    from sqlalchemy.orm import selectinload
    
    comments = session.exec(
        select(EntryComment)
        .options(selectinload(EntryComment.author))
        .where(EntryComment.entry_id == entry_id)
        .order_by(EntryComment.created_at.desc())
    ).all()
    
    # Manual serialization
    response = []
    for comment in comments:
        comment_dict = {
            "id": str(comment.id),
            "entry_id": str(comment.entry_id),
            "content": comment.content,
            "created_at": comment.created_at.isoformat(),
            "updated_at": comment.updated_at.isoformat() if comment.updated_at else None,
        }
        
        if comment.author:
            comment_dict["author"] = {
                "id": str(comment.author.id),
                "display_name": comment.author.display_name,
                "reputation_score": comment.author.reputation_score
            }
        
        response.append(comment_dict)
    
    return response

# Create a comment
@router.post("/")
def create_comment(
    comment_data: dict,
    session: Session = Depends(get_session),
    profile: Profile = Depends(get_current_profile)
):
    entry_id = comment_data.get("entry_id")
    content = comment_data.get("content")
    
    if not entry_id or not content:
        raise HTTPException(status_code=400, detail="Entry ID and content are required")
    
    new_comment = EntryComment(
        entry_id=uuid.UUID(entry_id),
        author_id=profile.id,
        content=content.strip()
    )
    
    session.add(new_comment)
    
    # Update user's reputation score for commenting
    # Award 10 points for adding a comment
    profile.reputation_score += 10
    session.add(profile)
    
    session.commit()
    session.refresh(new_comment)
    
    # Reload with author relationship
    from sqlalchemy.orm import selectinload
    refreshed_comment = session.exec(
        select(EntryComment)
        .options(selectinload(EntryComment.author))
        .where(EntryComment.id == new_comment.id)
    ).first()
    
    # Manual serialization
    response = {
        "id": str(refreshed_comment.id),
        "entry_id": str(refreshed_comment.entry_id),
        "content": refreshed_comment.content,
        "created_at": refreshed_comment.created_at.isoformat(),
    }
    
    if refreshed_comment.author:
        response["author"] = {
            "id": str(refreshed_comment.author.id),
            "display_name": refreshed_comment.author.display_name,
            "reputation_score": refreshed_comment.author.reputation_score
        }
    
    return response
