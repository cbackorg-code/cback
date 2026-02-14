from app.database import get_session
from app.models import CashbackEntry, Profile, EntryVote
from app.routers.votes import vote_entry
from sqlmodel import select
import uuid

def test_verification_flow():
    session = next(get_session())
    
    # 1. Get a test user (or existing user)
    # We'll use the first profile found
    user = session.exec(select(Profile)).first()
    if not user:
        print("❌ No user found to test with.")
        return

    # 2. Get a pending entry
    entry = session.exec(select(CashbackEntry).where(CashbackEntry.status == "pending")).first()
    if not entry:
        # Create one if none exists
        print("⚠️ No pending entry found. Creating one...")
        # ... logic to create ... 
        # Actually usually there is one. Let's assume there is one or grab ANY entry.
        entry = session.exec(select(CashbackEntry)).first()
        entry.status = "pending"
        entry.last_verified_at = None
        session.add(entry)
        session.commit()
    
    print(f"Testing with Entry: {entry.statement_name} (ID: {entry.id})")
    print(f"Testing with User: {user.display_name} (ID: {user.id})")

    # 3. Setup Pre-conditions: 4 Upvotes, 0 Downvotes
    # We fake this by just setting the counters. 
    # NOTE: In a real scenario we'd need 4 actual EntryVote rows from different users 
    # to be consistent, but our current logic only checks the counts on the Entry model.
    # The vote_entry function checks for *existing vote by THIS user*.
    # So we must ensure THIS user hasn't voted yet, or delete their vote.
    
    existing_vote = session.exec(
        select(EntryVote)
        .where(EntryVote.entry_id == entry.id)
        .where(EntryVote.user_id == user.id)
    ).first()
    
    if existing_vote:
        session.delete(existing_vote)
    
    entry.upvote_count = 4
    entry.downvote_count = 0
    session.add(entry)
    session.commit()
    session.refresh(entry)
    
    print(f"Pre-condition: Upvotes={entry.upvote_count}, Status={entry.status}")
    
    # 4. Call the vote_entry function (simulating API call)
    print("🚀 Casting 5th vote via vote_entry logic...")
    
    # We simulate the API call by calling the function directly
    # vote_entry(entry_id, vote_data, session, profile)
    response = vote_entry(
        entry_id=entry.id, 
        vote_data={"vote_type": "up"}, 
        session=session, 
        profile=user
    )
    
    # 5. Verify Result
    session.refresh(entry)
    print(f"Result: {response}")
    print(f"Post-condition: Upvotes={entry.upvote_count}, Status={entry.status}")
    
    if entry.status == "verified" and entry.upvote_count == 5:
        print("✅ SUCCESS: Auto-verification triggered successfully!")
    else:
        print("❌ FAILED: Auto-verification did not trigger.")

if __name__ == "__main__":
    test_verification_flow()
