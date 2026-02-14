from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List
import uuid
from datetime import datetime

from app.database import get_session
from app.models import Profile, CashbackEntry
from app.auth import get_current_profile

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
)

@router.get("/me")
def get_my_profile(
    profile: Profile = Depends(get_current_profile),
    session: Session = Depends(get_session)
):
    """
    Get current user's profile with statistics
    """
    # Count total contributions (entries added by user)
    total_entries = session.exec(
        select(func.count(CashbackEntry.id))
        .where(CashbackEntry.contributor_id == profile.id)
    ).one()
    
    # Get recent activity (last 5 entries)
    from sqlalchemy.orm import selectinload
    recent_entries = session.exec(
        select(CashbackEntry)
        .options(
            selectinload(CashbackEntry.merchant),
            selectinload(CashbackEntry.card)
        )
        .where(CashbackEntry.contributor_id == profile.id)
        .order_by(CashbackEntry.created_at.desc())
        .limit(5)
    ).all()
    
    # Serialize recent activity
    activity = []
    for entry in recent_entries:
        activity.append({
            "id": str(entry.id),
            "type": "added",  # For now, all are "added" entries
            "merchant": entry.merchant.canonical_name if entry.merchant else "Unknown",
            "date": entry.created_at.isoformat(),
            "cashback_rate": entry.reported_cashback_rate,
        })
    
    # Build response
    response = {
        "id": str(profile.id),
        "email": profile.email,
        "display_name": profile.display_name,
        "avatar_url": profile.avatar_url,
        "role": profile.role,
        "reputation_score": profile.reputation_score,
        "created_at": profile.created_at.isoformat(),
        "stats": {
            "total_contributions": total_entries,
            "total_entries": total_entries,  # Same for now
            "reputation": profile.reputation_score,
        },
        "recent_activity": activity
    }
    
    return response
