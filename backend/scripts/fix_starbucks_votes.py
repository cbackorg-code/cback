from sqlmodel import Session, select, col
from app.database import get_session
from app.models import CashbackEntry, Profile, EntryVote
import uuid
import random

def fix_starbucks_votes():
    session = next(get_session())
    
    # 1. Find Starbucks using LIKE to be sure
    starbucks = session.exec(select(CashbackEntry).where(col(CashbackEntry.statement_name).ilike("%COFFEE 123"))).first()
    
    if not starbucks:
        print("Starbucks entry not found via pattern '%COFFEE 123'!")
        # Fallback to listing all verify verified entries
        verified = session.exec(select(CashbackEntry).where(CashbackEntry.status == 'verified')).all()
        print(f"Verified entries found: {[e.statement_name for e in verified]}")
        return

    print(f"Found Starbucks Entry: '{starbucks.statement_name}' (ID: {starbucks.id})")
    print(f"Current State -> Status: {starbucks.status}, Up: {starbucks.upvote_count}, Down: {starbucks.downvote_count}")

    # 2. Reset Votes for this entry
    # Delete existing votes
    existing_votes = session.exec(select(EntryVote).where(EntryVote.entry_id == starbucks.id)).all()
    print(f"Deleting {len(existing_votes)} existing votes...")
    for v in existing_votes:
        session.delete(v)
    
    # 3. Create 5 Dummy Users (if they don't exist)
    dummy_users = []
    for i in range(5):
        email = f"voter{i}@test.com"
        user = session.exec(select(Profile).where(Profile.email == email)).first()
        if not user:
            user = Profile(
                id=uuid.uuid4(),
                email=email,
                display_name=f"Voter {i}",
                role="user",
                reputation_score=100
            )
            session.add(user)
            session.flush() # get ID
        dummy_users.append(user)
    
    # 4. Add 5 Upvotes
    print(f"Adding 5 new upvotes from dummy users ({[u.email for u in dummy_users]})...")
    for user in dummy_users:
        vote = EntryVote(
            entry_id=starbucks.id,
            user_id=user.id,
            vote_type="up"
        )
        session.add(vote)
    
    # 5. Update Entry Counts and Status
    starbucks.upvote_count = 5
    starbucks.downvote_count = 0
    starbucks.status = "verified" # Force verified
    
    session.add(starbucks)
    session.commit()
    session.refresh(starbucks)
    
    print(f"Fixed Starbucks! New Status: {starbucks.status}, Upvotes: {starbucks.upvote_count}, Down: {starbucks.downvote_count}")

if __name__ == "__main__":
    fix_starbucks_votes()
