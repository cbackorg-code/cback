import sys
import os
from dotenv import load_dotenv

# Load env from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

# Add 'backend' to path so we can import 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlmodel import Session, select
from app.database import engine
from app.models import Merchant

def check_db():
    with Session(engine) as session:
        # Print aggregated stats to avoid truncation
        from sqlmodel import func, col
        
        max_id = session.exec(select(func.max(Merchant.id))).first()
        print(f"MAX ID: {max_id}")
        
        # Count demo entries
        demo_count = session.exec(select(func.count(Merchant.id)).where(col(Merchant.contributor).ilike("%demo%"))).first()
        print(f"COUNT containing 'demo' in contributor: {demo_count}")
        
        # Count name 'demo'
        name_demo_count = session.exec(select(func.count(Merchant.id)).where(col(Merchant.name).ilike("%demo%"))).first()
        print(f"COUNT containing 'demo' in name: {name_demo_count}")
        
        # Show the very last entry details
        if max_id:
            last = session.get(Merchant, max_id)
            print(f"LAST ENTRY: [{last.id}] {last.name} ({last.source_sheet}) by {last.contributor}")

if __name__ == "__main__":
    check_db()
