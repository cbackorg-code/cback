
import sys
sys.path.append(r"d:\cback\backend")

from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def run():
    print("Testing via TestClient...")
    
    # 1. Get Card
    print("Getting cards...")
    try:
        cards_res = client.get("/cards/")
        print(f"Cards Status: {cards_res.status_code}")
        cards = cards_res.json()
        if not cards:
            print("No cards found")
            return
        card_id = cards[0]['id']
        
        # 2. Create Entry
        unique_name = f"EnumTest_{uuid.uuid4()}"
        print(f"Creating Entry: {unique_name}")
        payload = {
            "statement_name": unique_name,
            "card_id": card_id,
            "source_sheet": "sbi-cashback"
        }
        headers = {"Authorization": "Bearer demo-token"}
        
        # TestClient raises exceptions if app fails!
        res = client.post("/entries/", json=payload, headers=headers)
        print(f"Create Entry Status: {res.status_code}")
        print(f"Response: {res.text}")
        
    except Exception as e:
        print("Caught Exception in TestClient:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run()
