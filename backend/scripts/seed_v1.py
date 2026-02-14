import sys
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, SQLModel, select
from app.database import engine
from app.models import Profile, Card, Merchant, MerchantAlias, CashbackEntry

def seed_v1():
    print("Re-creating database tables...")
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # 1. Create Profile (Demo User)
        # In real app, this comes from Supabase Auth sync
        demo_user_id = uuid.uuid4()
        demo_profile = Profile(
            id=demo_user_id,
            email="demo@example.com",
            display_name="Demo User",
            role="user",
            reputation_score=100
        )
        session.add(demo_profile)
        
        # 2. Create Cards
        print("Seeding Cards...")
        cards_data = [
            {
                "slug": "sbi-cashback", 
                "name": "SBI Cashback", 
                "issuer": "SBI", 
                "network": "Visa", 
                "max_cashback_rate": 5.0
            },
            {
                "slug": "phonepe-black", 
                "name": "PhonePe Black", 
                "issuer": "PhonePe", 
                "network": "RuPay", 
                "max_cashback_rate": 2.0
            },
             {
                "slug": "swiggy-hdfc", 
                "name": "Swiggy HDFC", 
                "issuer": "HDFC", 
                "network": "Mastercard", 
                "max_cashback_rate": 5.0
            },
            {
                "slug": "amazon-pay-icici", 
                "name": "Amazon Pay ICICI", 
                "issuer": "ICICI", 
                "network": "Visa", 
                "max_cashback_rate": 5.0
            }
        ]
        
        card_map = {}
        for c in cards_data:
            card = Card(**c)
            session.add(card)
            card_map[c["slug"]] = card
        
        # 3. Create Canonical Merchants & Aliases
        print("Seeding Merchants...")
        
        # Starbucks
        m_starbucks = Merchant(canonical_name="Starbucks", category="Dining", default_mcc="5812")
        session.add(m_starbucks)
        
        a_starbucks_1 = MerchantAlias(merchant=m_starbucks, alias_text="STARBUCKS COFFEE")
        a_starbucks_2 = MerchantAlias(merchant=m_starbucks, alias_text="TATA STARBUCKS LTD")
        session.add(a_starbucks_1)
        session.add(a_starbucks_2)
        
        # Amazon
        m_amazon = Merchant(canonical_name="Amazon", category="Shopping", default_mcc="5399")
        session.add(m_amazon)
        
        a_amazon_1 = MerchantAlias(merchant=m_amazon, alias_text="AMAZON PAY INDIA PRIVATE LIMITED")
        a_amazon_2 = MerchantAlias(merchant=m_amazon, alias_text="AMZN Mktp US")
        session.add(a_amazon_1)
        session.add(a_amazon_2)

        # 4. Create Entries
        print("Seeding Entries...")
        
        # Entry 1: Starbucks on SBI Cashback
        entry_1 = CashbackEntry(
            card=card_map["sbi-cashback"],
            merchant=m_starbucks,
            contributor=demo_profile,
            statement_name="STARBUCKS COFFEE 123",
            reported_cashback_rate=5.0,
            mcc="5812",
            status="verified",
            notes="Works for gift card loads too",
            last_verified_at=datetime.utcnow()
        )
        session.add(entry_1)
        
        # Entry 2: Amazon on PhonePe Black
        entry_2 = CashbackEntry(
            card=card_map["phonepe-black"],
            merchant=m_amazon,
            contributor=demo_profile,
            statement_name="AMAZON PAY INDIA",
            reported_cashback_rate=1.0,
            status="pending"
        )
        session.add(entry_2)

        session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_v1()
