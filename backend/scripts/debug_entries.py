
from dotenv import load_dotenv
load_dotenv()

from sqlmodel import Session, select
from app.database import get_session
from app.models import CashbackEntry, Merchant



def debug_entries():
    session = next(get_session())
    from sqlmodel import col

    # Test Sort: High Cashback
    print("--- Test Sort: Cashback High ---")
    # Emulate the router logic
    query = select(CashbackEntry).order_by(col(CashbackEntry.reported_cashback_rate).desc(), col(CashbackEntry.updated_at).desc())
    page1 = session.exec(query.limit(5)).all()
    for e in page1:
        print(f"High: {e.reported_cashback_rate}% | {e.statement_name}")

    # Test Sort: Low Cashback
    print("\n--- Test Sort: Cashback Low ---")
    query = select(CashbackEntry).order_by(col(CashbackEntry.reported_cashback_rate).asc(), col(CashbackEntry.updated_at).desc())
    page1 = session.exec(query.limit(5)).all()
    for e in page1:
        print(f"Low: {e.reported_cashback_rate}% | {e.statement_name}")

if __name__ == "__main__":
    debug_entries()
