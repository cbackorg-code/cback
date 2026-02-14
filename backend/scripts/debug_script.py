
import sys
# Fix path
sys.path.append(r"d:\cback\backend")

from dotenv import load_dotenv
load_dotenv(r"d:\cback\backend\.env")

from sqlalchemy import text
from app.database import engine
from sqlmodel import Session


from sqlalchemy import text, select
from app.database import engine
from app.models import CashbackEntry, RateSuggestion, EntryVote, EntryStatus, SuggestionStatus, VoteType
from sqlmodel import Session


def run():
    print("Verifying RAW values from DB...")
    with engine.connect() as conn:
        res = conn.execute(text("SELECT status FROM cashback_entries LIMIT 5"))
        for row in res:
            val = row[0]
            print(f"Val: {repr(val)}, Hex: {val.encode('utf-8').hex() if val else 'NULL'}")
            
    print("\nVerifying Enum class...")
    print(f"EntryStatus values: {[e.value for e in EntryStatus]}")
    print(f"EntryStatus members: {[e.name for e in EntryStatus]}")
    
    try:
        print("Testing EntryStatus('pending'):", EntryStatus('pending'))
    except Exception as e:
        print("EntryStatus('pending') failed:", e)

if __name__ == "__main__":
    run()

if __name__ == "__main__":
    run()
