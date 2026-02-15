import sqlite3

DB_PATH = "backend_app.db"

def add_indexes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    indexes = [
        ("ix_cashback_entries_card_id", "cashback_entries", "card_id"),
        ("ix_cashback_entries_merchant_id", "cashback_entries", "merchant_id"),
        ("ix_cashback_entries_contributor_id", "cashback_entries", "contributor_id"),
        ("ix_entry_votes_entry_id", "entry_votes", "entry_id"),
        ("ix_entry_votes_user_id", "entry_votes", "user_id"),
        ("ix_rate_suggestions_entry_id", "rate_suggestions", "entry_id"),
        ("ix_rate_suggestions_user_id", "rate_suggestions", "user_id")
    ]
    
    print(f"Checking {len(indexes)} indexes...")
    
    for idx_name, table, column in indexes:
        try:
            cursor.execute(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table} ({column})")
            print(f"✅ Verified/Created index: {idx_name}")
        except Exception as e:
            print(f"❌ Failed to create index {idx_name}: {e}")
            
    conn.commit()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    add_indexes()
