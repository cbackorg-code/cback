from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlmodel import Session, select, col, func
from typing import List, Optional
import uuid

from app.database import get_session

from app.models import CashbackEntry, Merchant, Card, Profile, MerchantAlias, EntryVote, RateSuggestion, RateSuggestionVote, VoteType, EntryStatus, SuggestionStatus, ist_now
from app.auth import get_optional_user, get_current_user, get_current_profile, get_optional_profile
from app.limiter import limiter

router = APIRouter(
    prefix="/entries",
    tags=["entries"],
)

# Reading entries (The main feed)
@router.get("/", response_model=None)
@limiter.limit("60/minute") # Global read limit
def read_entries(
    request: Request,
    card_id: Optional[uuid.UUID] = None,
    merchant_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "merchant",
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    session: Session = Depends(get_session),
    profile: Optional[Profile] = Depends(get_optional_profile)
):
    from sqlalchemy.orm import selectinload
    
    # Use selectinload to eagerly load relationships
    query = select(CashbackEntry).options(
        selectinload(CashbackEntry.merchant),
        selectinload(CashbackEntry.card),
        selectinload(CashbackEntry.contributor)
    )
    
    # Joins for searching
    if search:
        # Use a subquery to find matching IDs to avoid duplicates from joins
        # This fixes the "SELECT DISTINCT + ORDER BY" error in Postgres
        sub_query = select(CashbackEntry.id).join(Merchant).outerjoin(MerchantAlias).where(
            (col(Merchant.canonical_name).ilike(f"%{search}%")) |
            (col(CashbackEntry.statement_name).ilike(f"%{search}%")) |
            (col(MerchantAlias.alias_text).ilike(f"%{search}%"))
        )
        query = query.where(CashbackEntry.id.in_(sub_query))
        
        # Ensure Merchant is joined for sorting if needed, but safe 1:1 join
        if sort == "merchant":
             query = query.join(Merchant)
    else:
        # If no search, we still need to join Merchant for sorting by merchant name
        if sort == "merchant":
             query = query.join(Merchant)
    
    if card_id:
        query = query.where(CashbackEntry.card_id == card_id)
        
    if merchant_id:
        query = query.where(CashbackEntry.merchant_id == merchant_id)
        
    # Sorting Logic
    if sort == "cashback-high":
        query = query.order_by(col(CashbackEntry.reported_cashback_rate).desc(), col(CashbackEntry.updated_at).desc())
    elif sort == "cashback-low":
        query = query.order_by(col(CashbackEntry.reported_cashback_rate).asc(), col(CashbackEntry.updated_at).desc())
    elif sort == "verified":
        # Sort by last_verified_at desc (nulls last)
        query = query.order_by(col(CashbackEntry.last_verified_at).desc().nulls_last())
    elif sort == "newest":
        query = query.order_by(col(CashbackEntry.created_at).desc())
    else: # default "merchant"
        # Sort by Merchant Name
        # Note: We ensured Merchant is joined above if search is empty
        query = query.order_by(col(Merchant.canonical_name).asc())

    entries = session.exec(query.offset(offset).limit(limit)).all()
    


    
    # Fetch user votes if logged in
    user_votes_map = {}
    if profile and entries:
        entry_ids = [e.id for e in entries]
        votes = session.exec(
            select(EntryVote)
            .where(EntryVote.user_id == profile.id)
            .where(EntryVote.entry_id.in_(entry_ids))
        ).all()
        user_votes_map = {v.entry_id: v.vote_type for v in votes}
    
    # Manual serialization to include relationships
    response = []
    for entry in entries:
        entry_dict = {
            "id": str(entry.id),
            "card_id": str(entry.card_id),
            "merchant_id": str(entry.merchant_id),
            "contributor_id": str(entry.contributor_id),
            "statement_name": entry.statement_name,
            "reported_cashback_rate": entry.reported_cashback_rate,
            "mcc": entry.mcc,
            "notes": entry.notes,
            "status": entry.status,
            "upvote_count": entry.upvote_count,
            "downvote_count": entry.downvote_count,
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
            "updated_at": entry.updated_at.isoformat() if entry.updated_at else None,

            "last_verified_at": entry.last_verified_at.isoformat() if entry.last_verified_at else None,
            "user_vote": user_votes_map.get(entry.id) # "up", "down", or None
        }
        
        # Add relationships
        if entry.merchant:
            entry_dict["merchant"] = {
                "id": str(entry.merchant.id),
                "canonical_name": entry.merchant.canonical_name,
                "category": entry.merchant.category,
                "default_mcc": entry.merchant.default_mcc
            }
        
        if entry.card:
            entry_dict["card"] = {
                "id": str(entry.card.id),
                "slug": entry.card.slug,
                "name": entry.card.name,
                "issuer": entry.card.issuer,
                "network": entry.card.network,
                "max_cashback_rate": entry.card.max_cashback_rate
            }
        
        if entry.contributor:
            entry_dict["contributor"] = {
                "id": str(entry.contributor.id),
                "display_name": entry.contributor.display_name
            }
        
        response.append(entry_dict)
    
    return response

# Get single entry by ID (MUST be before POST endpoint)
@router.get("/{entry_id}", response_model=None)
def read_entry(
    entry_id: uuid.UUID,
    session: Session = Depends(get_session),
    profile: Optional[Profile] = Depends(get_optional_profile)
):
    from sqlalchemy.orm import selectinload
    
    entry = session.exec(
        select(CashbackEntry)
        .options(
            selectinload(CashbackEntry.merchant),
            selectinload(CashbackEntry.card),
            selectinload(CashbackEntry.contributor)
        )
        .where(CashbackEntry.id == entry_id)
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Manual serialization
    response = {
        "id": str(entry.id),
        "card_id": str(entry.card_id),
        "merchant_id": str(entry.merchant_id),
        "contributor_id": str(entry.contributor_id),
        "statement_name": entry.statement_name,
        "reported_cashback_rate": entry.reported_cashback_rate,
        "mcc": entry.mcc,
        "notes": entry.notes,
        "status": entry.status,
        "upvote_count": entry.upvote_count,
        "downvote_count": entry.downvote_count,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
        "updated_at": entry.updated_at.isoformat() if entry.updated_at else None,
        "last_verified_at": entry.last_verified_at.isoformat() if entry.last_verified_at else None,

        "user_vote": None
    }

    if profile:
        vote = session.exec(
            select(EntryVote)
            .where(EntryVote.entry_id == entry_id)
            .where(EntryVote.user_id == profile.id)
        ).first()
        if vote:
            response["user_vote"] = vote.vote_type
    
    if entry.merchant:
        response["merchant"] = {
            "id": str(entry.merchant.id),
            "canonical_name": entry.merchant.canonical_name,
            "category": entry.merchant.category,
            "default_mcc": entry.merchant.default_mcc
        }
    
    if entry.card:
        response["card"] = {
            "id": str(entry.card.id),
            "slug": entry.card.slug,
            "name": entry.card.name,
            "issuer": entry.card.issuer,
            "network": entry.card.network,
            "max_cashback_rate": entry.card.max_cashback_rate
        }
    
    if entry.contributor:
        response["contributor"] = {
            "id": str(entry.contributor.id),
            "display_name": entry.contributor.display_name
        }
    
    return response

# Creating an entry (User Contribution)
@router.post("/", response_model=None)
@limiter.limit("5/minute")
def create_entry(
    request: Request,
    entry_data: dict, 
    session: Session = Depends(get_session),
    profile: Profile = Depends(get_current_profile) # Uses the new Auth helper
):
    # Extract data
    statement_name = entry_data.get("statement_name")
    card_id = entry_data.get("card_id")
    # Mapping old frontend 'source_sheet' style to card_id if not present?
    # The updated frontend should send card_id directly.
    # But for backward compatibility or if we haven't updated frontend yet:
    # We might need to map manual string names to IDs.
    # Ideally, frontend sends UUIDs.
    
    if not statement_name:
        raise HTTPException(status_code=400, detail="Statement name is required")

    # 1. Resolve Card
    card = None
    if card_id:
        card = session.get(Card, card_id)
    
    # Fallback: if frontend sends 'source_sheet' or card name, try to find card.
    if not card and "source_sheet" in entry_data:
        # Temporary mapping
        sheet = entry_data["source_sheet"]
        slug_map = {
            "sheet1": "sbi-cashback",
            "sheet2": "phonepe-black",
            "sheet3": "swiggy-hdfc",
            "sheet4": "amazon-pay-icici"
        }
        slug = slug_map.get(sheet)
        if slug:
            card = session.exec(select(Card).where(Card.slug == slug)).first()

    if not card:
        raise HTTPException(status_code=400, detail="Invalid Card")

    # 2. Merchant Matching Logic
    # Step A: Check for Alias match
    alias = session.exec(select(MerchantAlias).where(MerchantAlias.alias_text == statement_name)).first()
    
    merchant = None
    if alias:
        merchant = alias.merchant
    else:
        # Step B: Create New Merchant & Alias
        # We assume the name provided is a new Canonical Merchant for now
        # In a real system, you might want a human review queue or fuzzy match.
        merchant_name = entry_data.get("name") or statement_name
        
        # Validation: Junk Prevention
        import re
        if len(merchant_name) < 3:
             raise HTTPException(status_code=400, detail="Merchant name must be at least 3 characters")
        if len(merchant_name) > 100:
             raise HTTPException(status_code=400, detail="Merchant name too long")
        # Allow alphanumeric, spaces, and basics like & - ' . 
        # Reject heavy symbols to prevent weird spam
        if not re.match(r"^[a-zA-Z0-9\s\-\&\.\']+$", merchant_name):
             raise HTTPException(status_code=400, detail="Merchant name contains invalid characters. Only letters, numbers, spaces, and &-.' are allowed.")

        # Check if canonical merchant exists with this name (exact match)
        merchant = session.exec(select(Merchant).where(Merchant.canonical_name == merchant_name)).first()
        
        if not merchant:
            merchant = Merchant(
                canonical_name=merchant_name,
                category=entry_data.get("category"),
                default_mcc=entry_data.get("mcc")
            )
            session.add(merchant)
            session.flush() # Get ID
        
        # Create Alias
        new_alias = MerchantAlias(
            merchant_id=merchant.id,
            alias_text=statement_name
        )
        session.add(new_alias)
    
    # 3. Create Entry
    new_entry = CashbackEntry(
        card_id=card.id,
        merchant_id=merchant.id,
        contributor_id=profile.id,
        statement_name=statement_name,
        reported_cashback_rate=float(str(entry_data.get("cashback_rate", "0")).replace("%", "")),
        mcc=entry_data.get("mcc"),
        notes=entry_data.get("comments"),
        status=EntryStatus.pending
    )
    
    session.add(new_entry)
    
    # Update user's reputation score for contributing
    # Award 50 points for adding a new entry
    profile.reputation_score += 50
    session.add(profile)
    
    session.commit()
    session.refresh(new_entry)
    
    # Reload with relationships for the response
    from sqlalchemy.orm import selectinload
    refreshed_entry = session.exec(
        select(CashbackEntry)
        .options(
            selectinload(CashbackEntry.merchant),
            selectinload(CashbackEntry.card),
            selectinload(CashbackEntry.contributor)
        )
        .where(CashbackEntry.id == new_entry.id)
    ).first()
    
    # Manual serialization
    response = {
        "id": str(refreshed_entry.id),
        "card_id": str(refreshed_entry.card_id),
        "merchant_id": str(refreshed_entry.merchant_id),
        "contributor_id": str(refreshed_entry.contributor_id),
        "statement_name": refreshed_entry.statement_name,
        "reported_cashback_rate": refreshed_entry.reported_cashback_rate,
        "mcc": refreshed_entry.mcc,
        "notes": refreshed_entry.notes,
        "status": refreshed_entry.status,
        "created_at": refreshed_entry.created_at.isoformat(),
        "updated_at": refreshed_entry.updated_at.isoformat(),
    }
    
    if refreshed_entry.merchant:
        response["merchant"] = {
            "id": str(refreshed_entry.merchant.id),
            "canonical_name": refreshed_entry.merchant.canonical_name,
            "category": refreshed_entry.merchant.category
        }
    
    if refreshed_entry.card:
        response["card"] = {
            "id": str(refreshed_entry.card.id),
            "name": refreshed_entry.card.name,
            "slug": refreshed_entry.card.slug
        }
    
    if refreshed_entry.contributor:
        response["contributor"] = {
            "id": str(refreshed_entry.contributor.id),
            "display_name": refreshed_entry.contributor.display_name
        }
    
    return response


# ------------------------------
# Rate Suggestions API
# ------------------------------

@router.get("/{entry_id}/suggestions", response_model=None)
def get_rate_suggestions(
    entry_id: uuid.UUID,
    session: Session = Depends(get_session),
    profile: Optional[Profile] = Depends(get_optional_profile)
):
    """List pending suggestions for an entry"""
    suggestions = session.exec(
        select(RateSuggestion)
        .where(RateSuggestion.entry_id == entry_id)
        .where(RateSuggestion.status == "pending")
        .order_by(col(RateSuggestion.upvotes).desc())
    ).all()
    
    # Get user votes on these suggestions
    user_votes_map = {}
    if profile and suggestions:
        s_ids = [s.id for s in suggestions]
        votes = session.exec(
            select(RateSuggestionVote)
            .where(RateSuggestionVote.user_id == profile.id)
            .where(RateSuggestionVote.suggestion_id.in_(s_ids))
        ).all()
        user_votes_map = {v.suggestion_id: v.vote_type for v in votes}

    response = []
    for s in suggestions:
        # Load author manully if needed or rely on selectinload if we add it to query
        # Ideally we eager load author
        # Let's do a quick fetch for author display name if not loaded. 
        # But better to use options(selectinload(RateSuggestion.author)) above.
        
        # Re-query with eager load to be safe/clean or just lazy load (performance hit but ok for v1)
        # Actually, let's just lazy load since N is small (pending suggestions usually few)
        author_name = s.author.display_name if s.author else "Anonymous"
        
        response.append({
            "id": str(s.id),
            "entry_id": str(s.entry_id),
            "proposed_rate": s.proposed_rate,
            "reason": s.reason,
            "upvotes": s.upvotes,
            "downvotes": s.downvotes,
            "score": s.upvotes - s.downvotes,
            "user_vote": user_votes_map.get(s.id),
            "contributor": author_name,
            "created_at": s.created_at.isoformat(),
            "is_current_user": str(s.user_id) == str(profile.id) if profile else False
        })
        
    return response


@router.post("/{entry_id}/suggestions", response_model=None)
@limiter.limit("10/minute")
def create_rate_suggestion(
    request: Request,
    entry_id: uuid.UUID,
    suggestion_data: dict,
    session: Session = Depends(get_session),
    profile: Profile = Depends(get_current_profile)
):
    """Suggest a new rate"""
    # Check if entry exists
    entry = session.get(CashbackEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    proposed_rate = float(suggestion_data.get("proposed_rate", 0))
    if proposed_rate < 0 or proposed_rate > 100:
        raise HTTPException(status_code=400, detail="Invalid rate")

    # Logic B: "Consolidate Duplicates"
    # Check if ANYONE has a pending suggestion with the SAME rate & reason
    duplicate_suggestion = session.exec(
        select(RateSuggestion)
        .where(RateSuggestion.entry_id == entry_id)
        .where(RateSuggestion.proposed_rate == proposed_rate)
        # .where(RateSuggestion.reason == suggestion_data.reason) # Optional: strict match on reason? Maybe just rate.
        .where(RateSuggestion.status == SuggestionStatus.pending)
    ).first()

    if duplicate_suggestion:
        # If user IS the author
        if duplicate_suggestion.user_id == profile.id:
            raise HTTPException(status_code=400, detail="You already suggested this rate.")
            
        # Check if user already voted on it
        existing_vote = session.exec(
            select(RateSuggestionVote)
            .where(RateSuggestionVote.suggestion_id == duplicate_suggestion.id)
            .where(RateSuggestionVote.user_id == profile.id)
        ).first()
        
        if existing_vote:
             raise HTTPException(status_code=400, detail="You already supported this suggestion.")
        
        # Add support (Upvote)
        new_vote = RateSuggestionVote(
            suggestion_id=duplicate_suggestion.id,
            user_id=profile.id,
            vote_type=VoteType.up
        )
        duplicate_suggestion.upvotes += 1
        
        session.add(new_vote)
        session.add(duplicate_suggestion)
        session.commit()
        
        return {
            "id": str(duplicate_suggestion.id),
            "message": "Added your vote to the existing suggestion for this rate."
        }

    # Logic A: "Unique Pending"
    # Check if user ALREADY has a pending suggestion for this entry
    existing_suggestion = session.exec(
        select(RateSuggestion)
        .where(RateSuggestion.entry_id == entry_id)
        .where(RateSuggestion.user_id == profile.id)
        .where(RateSuggestion.status == SuggestionStatus.pending)
    ).first()
    
    if existing_suggestion:
        raise HTTPException(status_code=400, detail="You already have a pending suggestion for this entry.")
    
    # 3. Create New Suggestion
    new_suggestion = RateSuggestion(
        entry_id=entry_id,
        user_id=profile.id,
        proposed_rate=proposed_rate,
        reason=suggestion_data.get("reason"),
        status=SuggestionStatus.pending
    )
    
    session.add(new_suggestion)
    session.commit()
    session.refresh(new_suggestion)
    
    return {
        "id": str(new_suggestion.id),
        "message": "Suggestion submitted successfully"
    }


@router.post("/suggestions/{suggestion_id}/vote", response_model=None)
def vote_rate_suggestion(
    suggestion_id: uuid.UUID,
    vote_data: dict,
    session: Session = Depends(get_session),
    profile: Profile = Depends(get_current_profile)
):
    """Vote on a suggestion. Check threshold to auto-apply."""
    # Also, we might want to consolidate here too?
    # But usually UI shows the list, so we vote on specific ID.
    
    suggestion = session.get(RateSuggestion, suggestion_id)
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
        
    if suggestion.status != SuggestionStatus.pending:
        raise HTTPException(status_code=400, detail="Suggestion is not pending")

    vote_type = vote_data.get("vote_type") # "up" or "down"
    try:
        vote_type_enum = VoteType(vote_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    # Check existing vote
    existing_vote = session.exec(
        select(RateSuggestionVote)
        .where(RateSuggestionVote.suggestion_id == suggestion_id)
        .where(RateSuggestionVote.user_id == profile.id)
    ).first()

    if existing_vote:
        if existing_vote.vote_type == vote_type_enum:
            # Toggle off (remove vote)
            if vote_type_enum == VoteType.up:
                suggestion.upvotes -= 1
            else:
                suggestion.downvotes -= 1
            session.delete(existing_vote)
            session.add(suggestion)
            session.commit()
            
            score = suggestion.upvotes - suggestion.downvotes
            return {
                "upvotes": suggestion.upvotes,
                "downvotes": suggestion.downvotes,
                "score": score,
                "status": suggestion.status,
                "accepted": False,
                "user_vote": None # VOTE REMOVED
            }
            
        # Change vote
        if vote_type == "up":
            suggestion.upvotes += 1
            suggestion.downvotes -= 1
        else:
            suggestion.upvotes -= 1
            suggestion.downvotes += 1
        existing_vote.vote_type = vote_type
        session.add(existing_vote)
    else:
        # New vote
        new_vote = RateSuggestionVote(
            suggestion_id=suggestion_id,
            user_id=profile.id,
            vote_type=vote_type
        )
        if vote_type == "up":
            suggestion.upvotes += 1
        else:
            suggestion.downvotes += 1
        session.add(new_vote)

    score = suggestion.upvotes - suggestion.downvotes
    
    # 4. Check logic: e.g. threshold +5
    is_accepted = False
    if suggestion.upvotes - suggestion.downvotes >= 5:
        # ACCEPT
        is_accepted = True
        # 1. Update Entry
        entry = session.get(CashbackEntry, suggestion.entry_id)
        if entry:
            entry.reported_cashback_rate = suggestion.proposed_rate
            entry.last_verified_at = ist_now()
            session.add(entry)
            
            # 2. Mark Suggestion
            suggestion.status = SuggestionStatus.accepted
            
            # 3. Award Rep?
            author = session.get(Profile, suggestion.user_id)
            if author:
                author.reputation_score += 20 # Bonus for accepted edit
                session.add(author)

    session.add(suggestion)
    session.commit()
    
    return {
        "upvotes": suggestion.upvotes,
        "downvotes": suggestion.downvotes,
        "score": score,
        "status": suggestion.status,
        "accepted": is_accepted,
        "user_vote": vote_type
    }
