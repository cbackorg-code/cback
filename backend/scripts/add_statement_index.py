import sqlite3

DB_PATH = "backend_app.db"

def add_statement_index():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_cashback_entries_statement_name ON cashback_entries (statement_name)")
        print("✅ Verified/Created index: ix_cashback_entries_statement_name")
    except Exception as e:
        print(f"❌ Failed to create index: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_statement_index()
