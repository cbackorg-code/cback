import sqlite3

DB_PATH = "backend_app.db"

def add_alias_index():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_merchant_aliases_merchant_id ON merchant_aliases (merchant_id)")
        print("✅ Verified/Created index: ix_merchant_aliases_merchant_id")
    except Exception as e:
        print(f"❌ Failed to create index: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_alias_index()
