import sys
import os

# Fix path
sys.path.append(os.getcwd())

from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models import Card

def migrate():
    # Ensure tables exist
    create_db_and_tables()
    
    metadata = {
        "sbi-cashback": {
            "description": "5% cashback on online spends",
            "image_url": "https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2022/09/Cashback-SBI-Credit-Card.webp"
        },
        "phonepe-black": {
            "description": "SBI Card SELECT BLACK",
            "image_url": "https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2025/07/PhonePe-SBI-SELECT-BLACK-Credit-Card-1.webp"
        },
        "swiggy-hdfc": {
            "description": "10% cashback on Swiggy",
            "image_url": "https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2024/06/Swiggy-HDFC-Bank-Credit-Card.webp"
        },
        "amazon-pay-icici": {
            "description": "5% cashback on Amazon",
            "image_url": "https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2021/06/ICICI-Amazon-Pay-Credit-Card.webp"
        }
    }

    with Session(engine) as session:
        for slug, data in metadata.items():
            card = session.exec(select(Card).where(Card.slug == slug)).first()
            if card:
                print(f"Updating card: {slug}")
                if not card.description:
                    card.description = data["description"]
                if not card.image_url:
                    card.image_url = data["image_url"]
                session.add(card)
            else:
                print(f"Card not found: {slug}")
        
        session.commit()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
