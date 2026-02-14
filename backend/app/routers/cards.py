from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models import Card

router = APIRouter(
    prefix="/cards",
    tags=["cards"],
)

@router.get("/")
def read_cards(session: Session = Depends(get_session)):
    cards = session.exec(select(Card)).all()
    return cards
