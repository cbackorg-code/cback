from dotenv import load_dotenv
import os

load_dotenv() # Load env vars BEFORE importing app modules that rely on them

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.routers import entries
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

origins_str = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = origins_str.split(",")

# Rate Limiting Setup
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import entries
app.include_router(entries.router)

from app.routers import cards
app.include_router(cards.router)

from app.routers import comments
app.include_router(comments.router)

from app.routers import profiles
app.include_router(profiles.router)

from app.routers import votes, stats
app.include_router(votes.router)
app.include_router(stats.router)
# app.include_router(merchants.router) # Legacy router removed for V1

@app.get("/")
def read_root():
    return {"message": "Cashback Backend API is running"}
