from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, date
import uuid
import sqlalchemy as sa

# 0. ENUMS
# ------------------------------
class VoteType(str, Enum):
    up = "up"
    down = "down"

class EntryStatus(str, Enum):
    pending = "pending"
    verified = "verified"
    disputed = "disputed"
    rejected = "rejected"

class SuggestionStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


# ------------------------------
# 1. PROFILES (Extends Supabase Auth)
# ------------------------------
class Profile(SQLModel, table=True):
    __tablename__ = "profiles"
    
    id: uuid.UUID = Field(primary_key=True) # References auth.users(id)
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = Field(default="user") # 'user', 'admin', 'moderator'
    reputation_score: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    entries: List["CashbackEntry"] = Relationship(back_populates="contributor")
    votes: List["EntryVote"] = Relationship(back_populates="user")
    comments: List["EntryComment"] = Relationship(back_populates="author")
    rate_suggestions: List["RateSuggestion"] = Relationship(back_populates="author")
    suggestion_votes: List["RateSuggestionVote"] = Relationship(back_populates="user")


# ------------------------------
# 2. CARDS
# ------------------------------
class Card(SQLModel, table=True):
    __tablename__ = "cards"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(unique=True, index=True) # e.g. "sbi-cashback"
    name: str
    issuer: str # e.g. "SBI", "HDFC"
    network: str # e.g. "Visa", "Mastercard"
    description: Optional[str] = None
    image_url: Optional[str] = None
    max_cashback_rate: float = Field(default=0.0)
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    entries: List["CashbackEntry"] = Relationship(back_populates="card")


# ------------------------------
# 3. MERCHANTS (Canonical)
# ------------------------------
class Merchant(SQLModel, table=True):
    __tablename__ = "merchants"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    canonical_name: str = Field(index=True) # e.g. "Starbucks"
    category: Optional[str] = None # e.g. "Dining", "Travel"
    default_mcc: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    aliases: List["MerchantAlias"] = Relationship(back_populates="merchant")
    entries: List["CashbackEntry"] = Relationship(back_populates="merchant")


# ------------------------------
# 4. MERCHANT ALIASES
# ------------------------------
class MerchantAlias(SQLModel, table=True):
    __tablename__ = "merchant_aliases"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    merchant_id: uuid.UUID = Field(foreign_key="merchants.id")
    alias_text: str = Field(index=True) # e.g. "STARBUCKS COFFEE #123"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    merchant: Merchant = Relationship(back_populates="aliases")


# ------------------------------
# 5. CASHBACK ENTRIES (Core Contribution)
# ------------------------------
class CashbackEntry(SQLModel, table=True):
    __tablename__ = "cashback_entries"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    card_id: uuid.UUID = Field(foreign_key="cards.id")
    merchant_id: uuid.UUID = Field(foreign_key="merchants.id")
    contributor_id: uuid.UUID = Field(foreign_key="profiles.id")
    
    statement_name: str # The specific name on the statement
    reported_cashback_rate: float = Field(default=0.0)
    mcc: Optional[str] = None
    notes: Optional[str] = None
    status: EntryStatus = Field(
        default=EntryStatus.pending,
        sa_column=sa.Column(sa.Enum(EntryStatus, name="entry_status", create_type=False), nullable=False, default=EntryStatus.pending.value)
    ) # pending, verified, disputed, rejected
    
    transaction_date: Optional[date] = None
    last_verified_at: Optional[datetime] = None
    
    upvote_count: int = Field(default=0)
    downvote_count: int = Field(default=0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    card: Card = Relationship(back_populates="entries")
    merchant: Merchant = Relationship(back_populates="entries")
    contributor: Profile = Relationship(back_populates="entries")
    votes: List["EntryVote"] = Relationship(back_populates="entry")
    comments: List["EntryComment"] = Relationship(back_populates="entry")
    rate_suggestions: List["RateSuggestion"] = Relationship(back_populates="entry")


# ------------------------------
# 6. ENTRY VOTES
# ------------------------------
class EntryVote(SQLModel, table=True):
    __tablename__ = "entry_votes"

    entry_id: uuid.UUID = Field(foreign_key="cashback_entries.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="profiles.id", primary_key=True)
    vote_type: VoteType = Field(sa_column=sa.Column(sa.Enum(VoteType, name="vote_type", create_type=False), nullable=False)) # "up" or "down"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    entry: CashbackEntry = Relationship(back_populates="votes")
    user: Profile = Relationship(back_populates="votes")


# ------------------------------
# 7. ENTRY COMMENTS
# ------------------------------
class EntryComment(SQLModel, table=True):
    __tablename__ = "entry_comments"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    entry_id: uuid.UUID = Field(foreign_key="cashback_entries.id", index=True)
    author_id: uuid.UUID = Field(foreign_key="profiles.id", index=True)
    content: str
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    # Relationships
    entry: CashbackEntry = Relationship(back_populates="comments")
    author: Profile = Relationship(back_populates="comments")


# ------------------------------
# 8. RATE SUGGESTIONS (Community Edits)
# ------------------------------
class RateSuggestion(SQLModel, table=True):
    __tablename__ = "rate_suggestions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    entry_id: uuid.UUID = Field(foreign_key="cashback_entries.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="profiles.id", index=True)
    
    proposed_rate: float
    reason: Optional[str] = None
    status: SuggestionStatus = Field(
        default=SuggestionStatus.pending,
        sa_column=sa.Column(sa.Enum(SuggestionStatus, name="suggestion_status", create_type=False), nullable=False, default=SuggestionStatus.pending.value)
    )
    
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    entry: CashbackEntry = Relationship(back_populates="rate_suggestions")
    author: Profile = Relationship(back_populates="rate_suggestions")
    votes: List["RateSuggestionVote"] = Relationship(back_populates="suggestion")


# ------------------------------
# 9. SUGGESTION VOTES
# ------------------------------
class RateSuggestionVote(SQLModel, table=True):
    __tablename__ = "rate_suggestion_votes"

    suggestion_id: uuid.UUID = Field(foreign_key="rate_suggestions.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="profiles.id", primary_key=True)
    vote_type: VoteType = Field(sa_column=sa.Column(sa.Enum(VoteType, name="vote_type", create_type=False), nullable=False)) # "up", "down"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    suggestion: RateSuggestion = Relationship(back_populates="votes")
    user: Profile = Relationship(back_populates="suggestion_votes")
