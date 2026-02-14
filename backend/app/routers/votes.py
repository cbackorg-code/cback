from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid
from datetime import datetime

from app.database import get_session
from app.database import get_session
from app.models import EntryVote, CashbackEntry, Profile, VoteType, EntryStatus
from app.auth import get_current_profile

router = APIRouter(
    prefix="/votes",
    tags=["votes"],
)

@router.post("/entries/{entry_id}", response_model=None)
def vote_entry(
    entry_id: uuid.UUID,
    vote_data: dict,  # {"vote_type": "up" | "down"}
    session: Session = Depends(get_session),
    profile: Profile = Depends(get_current_profile)
):
    vote_type = vote_data.get("vote_type")
    # Basic validation (Pydantic would handle this if we used a model)
    try:
        vote_type_enum = VoteType(vote_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vote type. Must be 'up' or 'down'")

    # 1. Get the entry
    entry = session.get(CashbackEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    # 2. Check if user already voted
    existing_vote = session.exec(
        select(EntryVote)
        .where(EntryVote.entry_id == entry_id)
        .where(EntryVote.user_id == profile.id)
    ).first()

    user_vote_status = vote_type

    if existing_vote:
        # Update existing vote
        if existing_vote.vote_type == vote_type_enum:
            # Toggle off (remove vote)
            if vote_type_enum == VoteType.up:
                entry.upvote_count -= 1
            else:
                entry.downvote_count -= 1
            
            session.delete(existing_vote)
            user_vote_status = None
        else:
            # Switch vote (e.g. up -> down)
            if existing_vote.vote_type == VoteType.up:
                entry.upvote_count -= 1
                entry.downvote_count += 1
            else:
                entry.downvote_count -= 1
                entry.upvote_count += 1
            
            existing_vote.vote_type = vote_type_enum
            session.add(existing_vote)
    else:
        # New vote
        new_vote = EntryVote(
            entry_id=entry_id,
            user_id=profile.id,
            vote_type=vote_type_enum
        )
        session.add(new_vote)
        
        if vote_type_enum == VoteType.up:
            entry.upvote_count += 1
        else:
            entry.downvote_count += 1

    # 3. Auto-Verification Logic
    # Rule: If upvotes >= 5 AND downvotes == 0, mark as verified
    if entry.upvote_count >= 5 and entry.downvote_count == 0:
        if entry.status != EntryStatus.verified:
            entry.status = EntryStatus.verified
            entry.last_verified_at = datetime.utcnow()
            # Optional: Award extra reputation to contributor for getting verified?
            
            # Additional Rule: If verified but gets downvoted, maybe revert to disputed?
    elif entry.status == EntryStatus.verified and entry.downvote_count > 0:
        # If a verified entry gets a downvote, mark as disputed
        entry.status = EntryStatus.disputed
        # We don't clear last_verified_at so we know it WAS verified at some point

    session.add(entry)
    session.commit()
    session.refresh(entry)

    return {
        "message": "Vote recorded",
        "upvotes": entry.upvote_count,
        "downvotes": entry.downvote_count,
        "status": entry.status,
        "is_verified": entry.status == "verified",
        "user_vote": user_vote_status
    }

# Admin endpoint to directly set vote counts (for testing/fixing data)
@router.post("/admin/set-votes/{entry_id}", response_model=None)
def admin_set_votes(
    entry_id: uuid.UUID,
    data: dict,  # {"upvotes": 5, "downvotes": 0, "status": "verified"}
    session: Session = Depends(get_session),
):
    entry = session.get(CashbackEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    if "upvotes" in data:
        entry.upvote_count = data["upvotes"]
    if "downvotes" in data:
        entry.downvote_count = data["downvotes"]
    if "status" in data:
        entry.status = data["status"]
        if data["status"] == "verified":
            entry.last_verified_at = datetime.utcnow()
        else:
            entry.last_verified_at = None
    
    session.add(entry)
    session.commit()
    session.refresh(entry)
    
    return {
        "message": "Entry updated",
        "statement_name": entry.statement_name,
        "upvotes": entry.upvote_count,
        "downvotes": entry.downvote_count,
        "status": entry.status,
        "last_verified_at": str(entry.last_verified_at)
    }
