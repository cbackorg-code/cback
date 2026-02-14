from sqlmodel import Session, select, col
from app.database import get_session
from app.models import CashbackEntry, Profile, EntryVote
from datetime import datetime
import uuid

def final_fix():
    session = next(get_session())
    
    # 1. Reset Starbucks completely
    print("--- Resetting Starbucks ---")
    starbucks_entries = session.exec(
        select(CashbackEntry).where(col(CashbackEntry.statement_name).ilike("%STARBUCKS%"))
    ).all()
    
    for entry in starbucks_entries:
        print(f"  Found: {entry.statement_name} (Status: {entry.status}, Up: {entry.upvote_count}, Down: {entry.downvote_count})")
        
        # Delete all votes
        votes = session.exec(select(EntryVote).where(EntryVote.entry_id == entry.id)).all()
        for v in votes:
            session.delete(v)
        
        entry.upvote_count = 0
        entry.downvote_count = 0
        entry.status = "pending"
        entry.last_verified_at = None  # CRITICAL: Clear the timestamp!
        session.add(entry)
        print(f"  -> Reset: pending, 0/0, last_verified_at=None")

    # 2. Find Amazon Pay and verify it
    print("\n--- Verifying Amazon Pay ---")
    amazon = session.exec(
        select(CashbackEntry).where(col(CashbackEntry.statement_name).ilike("%AMAZON%"))
    ).first()
    
    if not amazon:
        print("  Amazon entry not found! Trying any other non-Starbucks entry...")
        all_entries = session.exec(select(CashbackEntry)).all()
        for e in all_entries:
            if "STARBUCKS" not in e.statement_name.upper():
                amazon = e
                break
    
    if not amazon:
        print("  No entries to verify!")
        return
        
    print(f"  Found: {amazon.statement_name} (Status: {amazon.status})")
    
    # Clear existing votes
    votes = session.exec(select(EntryVote).where(EntryVote.entry_id == amazon.id)).all()
    for v in votes:
        session.delete(v)
    
    # Create 5 dummy verifiers
    for i in range(5):
        email = f"verifier{i}@test.com"
        user = session.exec(select(Profile).where(Profile.email == email)).first()
        if not user:
            user = Profile(
                id=uuid.uuid4(),
                email=email,
                display_name=f"Verifier {i}",
                role="user",
                reputation_score=100
            )
            session.add(user)
            session.flush()
        
        vote = EntryVote(
            entry_id=amazon.id,
            user_id=user.id,
            vote_type="up"
        )
        session.add(vote)
    
    amazon.upvote_count = 5
    amazon.downvote_count = 0
    amazon.status = "verified"
    amazon.last_verified_at = datetime.utcnow()  # Set verified timestamp
    session.add(amazon)
    
    session.commit()
    
    # Verify final state
    print("\n--- Final State ---")
    all_entries = session.exec(select(CashbackEntry)).all()
    for e in all_entries:
        print(f"  {e.statement_name} | Status: {e.status} | Up: {e.upvote_count} | Down: {e.downvote_count} | Verified At: {e.last_verified_at}")

if __name__ == "__main__":
    final_fix()
