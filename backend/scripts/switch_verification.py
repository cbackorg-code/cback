from sqlmodel import Session, select, col
from app.database import get_session
from app.models import CashbackEntry, Profile, EntryVote
import uuid
import random

def switch_verification():
    session = next(get_session())
    
    # 1. Reset Starbucks (Unverify)
    print("--- STEP 1: Resetting Starbucks ---")
    starbucks_entries = session.exec(select(CashbackEntry).where(col(CashbackEntry.statement_name).ilike("%COFFEE%"))).all()
    for entry in starbucks_entries:
        print(f"Found Starbucks Entry: {entry.statement_name} (Status: {entry.status})")
        # Delete votes
        votes = session.exec(select(EntryVote).where(EntryVote.entry_id == entry.id)).all()
        for v in votes:
            session.delete(v)
        
        # Reset counts
        entry.upvote_count = 0
        entry.downvote_count = 0
        entry.status = "pending"
        session.add(entry)
        print(f"-> Reset to Pending, 0/0 votes")

    # 2. Verify 'AMAZON PAY INDIA' (Verify)
    print("\n--- STEP 2: Verifying Amazon ---")
    amazon = session.exec(select(CashbackEntry).where(col(CashbackEntry.statement_name).ilike("%AMAZON PAY%"))).first()
    
    if not amazon:
        # Fallback to any other pending entry if Amazon not found
        amazon = session.exec(select(CashbackEntry).where(CashbackEntry.status == "pending")).first()
        if not amazon:
            print("No pending entry found to verify!")
            return

    print(f"Targeting Entry: {amazon.statement_name} (Current Status: {amazon.status})")
    
    # Clear existing votes for target
    votes = session.exec(select(EntryVote).where(EntryVote.entry_id == amazon.id)).all()
    for v in votes:
        session.delete(v)
        
    # Create 5 Dummy Users
    dummy_users = []
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
        dummy_users.append(user)

    # Add 5 Upvotes
    for user in dummy_users:
        vote = EntryVote(
            entry_id=amazon.id,
            user_id=user.id,
            vote_type="up"
        )
        session.add(vote)
    
    # Update Status
    amazon.upvote_count = 5
    amazon.downvote_count = 0
    amazon.status = "verified"
    session.add(amazon)
    
    session.commit()
    print(f"-> Verified '{amazon.statement_name}' with 5 upvotes!")

if __name__ == "__main__":
    switch_verification()
