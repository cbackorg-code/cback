from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session, select, col
from typing import List, Optional

from app.database import get_session
from app.models import Merchant
from app.auth import get_current_user, get_current_admin_user, get_optional_user

router = APIRouter(
    prefix="/merchants",
    tags=["merchants"],
)

@router.get("/", response_model=List[Merchant])
def read_merchants(
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    search: Optional[str] = None,
    source_sheet: Optional[str] = None,
    session: Session = Depends(get_session),
    user: Optional[dict] = Depends(get_optional_user) # Optional Auth
):
    query = select(Merchant)
    if search:
        query = query.where(col(Merchant.name).contains(search))
    if source_sheet:
        query = query.where(Merchant.source_sheet == source_sheet)
    
    merchants = session.exec(query.offset(offset).limit(limit)).all()
    return merchants

@router.post("/", response_model=Merchant)
def create_merchant(
    merchant: Merchant,
    session: Session = Depends(get_session),
    user: dict = Depends(get_current_user) # Allow any authenticated user
):
    # Auto-fill contributor if not provided or override it to ensure truth
    # user dict comes from jwt payload.
    # Supabase JWT usually has 'email' or 'user_metadata'
    email = user.get("email", "Unknown")
    user_metadata = user.get("user_metadata", {})
    name = user_metadata.get("name") or user_metadata.get("full_name") or email.split("@")[0]
    
    merchant.contributor = name
    
    session.add(merchant)
    session.commit()
    session.refresh(merchant)
    print(f"DEBUG: Created merchant {merchant.name} (Source: {merchant.source_sheet}) with ID {merchant.id}")
    return merchant

@router.get("/{merchant_id}", response_model=Merchant)
def read_merchant(merchant_id: int, session: Session = Depends(get_session)):
    merchant = session.get(Merchant, merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return merchant
