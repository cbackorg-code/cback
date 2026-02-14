"""
Script to recalculate reputation scores for all users based on their existing contributions.
This fixes the issue where users had entries added before the reputation increment logic was implemented.
"""

from app.database import get_session
from app.models import Profile, CashbackEntry, EntryComment
from sqlmodel import select, func

def recalculate_all_reputations():
    session = next(get_session())
    
    profiles = session.exec(select(Profile)).all()
    
    for profile in profiles:
        # Count entries: 50 points each
        entry_count = session.exec(
            select(func.count(CashbackEntry.id))
            .where(CashbackEntry.contributor_id == profile.id)
        ).one()
        
        # Count comments: 10 points each
        comment_count = session.exec(
            select(func.count(EntryComment.id))
            .where(EntryComment.author_id == profile.id)
        ).one()
        
        # Calculate total reputation
        new_reputation = (entry_count * 50) + (comment_count * 10)
        
        print(f"{profile.display_name}:")
        print(f"  Old reputation: {profile.reputation_score}")
        print(f"  Entries: {entry_count} x 50 = {entry_count * 50}")
        print(f"  Comments: {comment_count} x 10 = {comment_count * 10}")
        print(f"  New reputation: {new_reputation}")
        print()
        
        # Update reputation
        profile.reputation_score = new_reputation
        session.add(profile)
    
    session.commit()
    print("✅ All reputation scores have been recalculated!")

if __name__ == "__main__":
    recalculate_all_reputations()
