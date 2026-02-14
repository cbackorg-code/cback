from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.database import get_session
from app.models import Card, Merchant, CashbackEntry, Profile

router = APIRouter(
    prefix="/stats",
    tags=["stats"],
)

class DashboardStats(BaseModel):
    total_cards: int
    total_merchants: int
    total_contributors: int
    last_updated: Optional[datetime]

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(session: Session = Depends(get_session)):
    # 1. Total Cards
    total_cards = session.exec(select(func.count(Card.id))).one()
    
    # 2. Total Merchants (Canonical)
    total_merchants = session.exec(select(func.count(Merchant.id))).one()
    
    # 3. Total Contributors (Unique profiles with entries)
    # Distinct count of contributor_id in cashback_entries
    total_contributors = session.exec(
        select(func.count(func.distinct(CashbackEntry.contributor_id)))
    ).one()
    
    # 4. Last Updated
    last_updated = session.exec(select(func.max(CashbackEntry.updated_at))).one()
    
    return DashboardStats(
        total_cards=total_cards,
        total_merchants=total_merchants,
        total_contributors=total_contributors,
        last_updated=last_updated
    )
