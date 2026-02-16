import csv
import argparse
import sys
import os
import re
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Ensure we can import from app
# backend/scripts/import_cashback_csv.py -> backend/scripts -> backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models import Merchant, CashbackEntry, Card, Profile, EntryStatus

def clean_percentage(value):
    if not value:
        return None
    # Check if it looks like a number/percentage
    if re.match(r'^[0-9.]', value):
        try:
            return float(value.replace('%', ''))
        except ValueError:
            return None
    return None

def clean_date(value):
    if not value:
        return None
    try:
        # Try parsing 'DD-Mon-YYYY' format from CSV
        # Handle cases where Excel might have exported different date formats if needed
        return datetime.strptime(value, '%d-%b-%Y').date()
    except ValueError:
        return None

def import_csv(csv_files):
    """
    Imports data from CSV files into the database.
    Uses SQLModel ORM for safe type handling across SQLite/PostgreSQL.
    """
    
    # Ensure tables exist
    print("✅ Ensuring database tables exist...")
    create_db_and_tables()
    
    # Hardcoded IDs (ensure these exist or handle their creation if needed)
    CARD_ID = uuid.UUID('9e5a21a1-d193-4486-ae00-7c3d517a239e')
    CONTRIBUTOR_ID = uuid.UUID('2e06269c-3150-49ec-b5b5-4afce215b756')
    
    with Session(engine) as session:
        # Step 1: Process CSVs in Memory (Python Staging)
        print(f"✅ Processing {len(csv_files)} CSV file(s)...")
        
        cleaned_rows = []
        for file_path in csv_files:
            print(f"   Processing: {file_path}")
            if not os.path.exists(file_path):
                print(f"   ❌ File not found: {file_path}")
                continue

            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.reader(f)
                next(reader, None) # Skip header
                
                for row in reader:
                    # Pad row
                    while len(row) < 6:
                        row.append(None)
                    
                    m_raw = row[0]
                    statement_name = row[1]
                    cashback_text = row[2]
                    # contributor_name = row[3] # Unused, we use fixed ID
                    txn_date_text = row[4]
                    comments = row[5]
                    
                    if not m_raw or 'merchant' in m_raw.lower() or 'kindly fill' in m_raw.lower():
                        continue
                        
                    cleaned_rows.append({
                        "merchant_name": m_raw.strip(),
                        "statement_name": statement_name.strip() if statement_name else None,
                        "reported_cashback_rate": clean_percentage(cashback_text),
                        "transaction_date": clean_date(txn_date_text),
                        "notes": comments.strip() if comments else None
                    })
        
        print(f"   Total valid rows to process: {len(cleaned_rows)}")
        
        # Step 2: Handle Merchants
        print("✅ Handling merchants...")
        
        # Get existing merchants map (canonical_name_lower -> id)
        existing_merchants = session.exec(select(Merchant)).all()
        merchant_map = {m.canonical_name.lower(): m.id for m in existing_merchants}
        
        merchants_to_add = {}
        for row in cleaned_rows:
            m_name = row["merchant_name"]
            m_name_lower = m_name.lower()
            
            if m_name_lower not in merchant_map and m_name_lower not in merchants_to_add:
                # Create new merchant instance
                new_id = uuid.uuid4()
                merchants_to_add[m_name_lower] = Merchant(
                    id=new_id,
                    canonical_name=m_name,
                    created_at=datetime.utcnow()
                )
                merchant_map[m_name_lower] = new_id
        
        if merchants_to_add:
            print(f"   -> Creating {len(merchants_to_add)} new merchants...")
            for m in merchants_to_add.values():
                session.add(m)
            session.commit()
        else:
            print("   -> No new merchants to create.")

        # Step 3: Insert Entries
        print("✅ Inserting cashback entries...")
        
        entries_added = 0
        skipped_rate = 0
        
        # Fetch existing entries to avoid duplicates (naive check: merchant_id + statement_name)
        # In a massive import, you'd want to be careful here. 
        # We'll just fetch all for this card for simplicity as per original script logic
        existing_entries = session.exec(select(CashbackEntry).where(CashbackEntry.card_id == CARD_ID)).all()
        existing_sigs = set()
        for e in existing_entries:
            # signature: merchant_id + statement_name + transaction_date
            existing_sigs.add((e.merchant_id, e.statement_name, e.transaction_date))

        for row in cleaned_rows:
            if row['reported_cashback_rate'] is None:
                skipped_rate += 1
                continue
                
            m_id = merchant_map.get(row['merchant_name'].lower())
            if not m_id:
                # Should not happen as we just created them
                continue
                
            sig = (m_id, row['statement_name'], row['transaction_date'])
            if sig in existing_sigs:
                continue

            entry = CashbackEntry(
                id=uuid.uuid4(),
                card_id=CARD_ID,
                merchant_id=m_id,
                contributor_id=CONTRIBUTOR_ID,
                statement_name=row['statement_name'] or "",
                reported_cashback_rate=row['reported_cashback_rate'],
                notes=row['notes'],
                status=EntryStatus.pending,
                transaction_date=row['transaction_date'],
                mcc=None, # Default to None if not inferred
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(entry)
            entries_added += 1
            existing_sigs.add(sig) # Add to seen so we don't duplicate within the same batch

        session.commit()
        print(f"   -> Inserted {entries_added} entries.")
        if skipped_rate > 0:
            print(f"   ⚠️ Skipped {skipped_rate} rows due to invalid cashback rate.")
            
    print("\n🎉 Import completed successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Cashback CSV Data")
    parser.add_argument("csv_files", nargs='+', help="Path to one or more CSV files")
    args = parser.parse_args()
    
    # Load env vars to ensure we connect to the right DB
    load_dotenv()
    
    import_csv(args.csv_files)
