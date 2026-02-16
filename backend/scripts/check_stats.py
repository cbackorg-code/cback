
from dotenv import load_dotenv
load_dotenv()

from sqlmodel import Session, select, func
from app.database import get_session
from app.models import CashbackEntry

def check_distribution():
    session = next(get_session())
    
    # Check total count
    total = session.exec(select(func.count(CashbackEntry.id))).one()
    print(f"Total Entries: {total}")
    
    # Check 5% count
    five_percent = session.exec(select(func.count(CashbackEntry.id)).where(CashbackEntry.reported_cashback_rate >= 5.0)).one()
    print(f"Entries >= 5%: {five_percent}")
    
    # Check 0% count
    zero_percent = session.exec(select(func.count(CashbackEntry.id)).where(CashbackEntry.reported_cashback_rate == 0)).one()
    print(f"Entries == 0%: {zero_percent}")

if __name__ == "__main__":
    check_distribution()
