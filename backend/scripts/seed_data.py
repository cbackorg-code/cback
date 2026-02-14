import csv
import sys
import os
from dotenv import load_dotenv

load_dotenv() # Load env vars from .env

# Add parent directory to path so we can import app modules
# Assuming script is run from backend/scripts or backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models import Merchant

def seed_merchants(csv_file_path: str, source_sheet_name: str):
    print(f"Seeding from {csv_file_path}...")
    if not os.path.exists(csv_file_path):
        print(f"File not found: {csv_file_path}")
        return

    with Session(engine) as session:
        # Initial check to avoid duplicates if re-run (optional, for now just append or maybe clear?)
        # For simplicity, we append. In a real scenario, we might want to check existence or truncate table.
        
        with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader)  # Skip header
            
            count = 0
            for row in reader:
                if not row: continue
                
                # Mapping based on observed CSV structure:
                # 0: Name
                # 1: Statement Name
                # 2: Cashback Rate
                # 3: Contributor
                # 4: Date
                # 5: Comments
                # 6: Last Tried Date
                
                name = row[0].strip() if len(row) > 0 else ""
                if not name: continue
                
                merchant = Merchant(
                    name=name,
                    statement_name=row[1].strip() if len(row) > 1 else None,
                    cashback_rate=row[2].strip() if len(row) > 2 else None,
                    contributor=row[3].strip() if len(row) > 3 else None,
                    date=row[4].strip() if len(row) > 4 else None,
                    comments=row[5].strip() if len(row) > 5 else None,
                    last_tried_date=row[6].strip() if len(row) > 6 else None,
                    source_sheet=source_sheet_name
                )
                session.add(merchant)
                count += 1
            
            session.commit()
            print(f"Seeded {count} merchants from {source_sheet_name}")

if __name__ == "__main__":
    create_db_and_tables()
    # Adjust path as needed. Assuming running from backend root or scripts dir
    base_path = "d:/cback"
    seed_merchants(os.path.join(base_path, "sheet1.csv"), "sheet1")
    # Add other sheets if needed
    # seed_merchants(os.path.join(base_path, "sheet2.csv"), "sheet2")
