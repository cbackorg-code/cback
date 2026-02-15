from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List
import uuid
from datetime import datetime

from app.database import get_session
from app.models import Profile, CashbackEntry, RateSuggestion, SuggestionStatus
from app.auth import get_current_profile
from sqlalchemy.orm import selectinload

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
    # 1. Count total contributions (entries added by user)
    total_entries = session.exec(
        select(func.count(CashbackEntry.id))
        .where(CashbackEntry.contributor_id == profile.id)
    ).one()

    # 2. Count approved edits (rate suggestions)
    
    approved_edits = session.exec(
        select(func.count(RateSuggestion.id))
        .where(RateSuggestion.user_id == profile.id)
        .where(RateSuggestion.status == SuggestionStatus.accepted)
    ).one()
    
    # 3. Get recent activity (last 5 entries)
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
            "total_entries": total_entries,
            "approved_edits": approved_edits,
            "reputation": profile.reputation_score,
        },
        "recent_activity": activity
    }
    
    return response

@router.get("/{user_id}")
def get_public_profile(
    user_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    """
    Get public profile of a user (no sensitive info)
    """
    profile = session.get(Profile, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Count total contributions
    total_entries = session.exec(
        select(func.count(CashbackEntry.id))
        .where(CashbackEntry.contributor_id == profile.id)
    ).one()

    # 2. Count approved edits
    approved_edits = session.exec(
        select(func.count(RateSuggestion.id))
        .where(RateSuggestion.user_id == profile.id)
        .where(RateSuggestion.status == SuggestionStatus.accepted)
    ).one()
    
    # 3. Get recent activity (last 5 entries)
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
            "type": "added",
            "merchant": entry.merchant.canonical_name if entry.merchant else "Unknown",
            "date": entry.created_at.isoformat(),
            "cashback_rate": entry.reported_cashback_rate,
        })

    return {
        "id": str(profile.id),
        "display_name": profile.display_name,
        "avatar_url": profile.avatar_url,
        "reputation_score": profile.reputation_score,
        "created_at": profile.created_at.isoformat(),
        "stats": {
            "total_contributions": total_entries,
            "total_entries": total_entries,
            "approved_edits": approved_edits,
            "reputation": profile.reputation_score,
        },
        "recent_activity": activity
    }
