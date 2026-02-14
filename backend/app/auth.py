import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlmodel import Session, select
import uuid

from app.database import get_session
from app.models import Profile

# Security scheme
security = HTTPBearer()

# Environment variable for Supabase JWT Secret
# This is crucial for verifying the token signature
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Decodes the JWT token from Supabase and returns the user payload.
    """
    token = credentials.credentials
    
    # Allow Demo Token for Guest Mode
    if token == "demo-token":
        return {
            "sub": "demo-user-id",
            "email": "demo@example.com",
            "role": "user",
            "app_metadata": {"provider": "demo"}
        }
    
    if not SUPABASE_JWT_SECRET:
        # If secret is not set, we can't verify. Warn or fail.
        # For dev without secret, maybe allow mock if configured?
        # But securely, we should fail.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Missing JWT Secret"
        )
        
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM], audience="authenticated")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# We need a new security scheme with auto_error=False for optional auth
security_optional = HTTPBearer(auto_error=False)

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)):
    if not credentials:
        return None
    
    token = credentials.credentials
    
    # Allow Demo Token for Guest Mode (Same as get_current_user)
    if token == "demo-token":
        return {
            "sub": "demo-user-id",
            "email": "demo@example.com",
            "role": "user",
            "app_metadata": {"provider": "demo"}
        }

    if not SUPABASE_JWT_SECRET:
         return None
         
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM], audience="authenticated")
        return payload
    except:
        return None



def get_current_profile(
    payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Returns the Profile object for the authenticated user.
    Creates the profile if it doesn't exist (Lazy Sync).
    """
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token payload")
        
    # Handle Demo Mode special UUID
    if user_id == "demo-user-id":
        # Ensure demo user exists (seed should have created it, but just in case)
        # For simplicity, we assume seed ran. querying by ID which is UUID.
        # But "demo-user-id" is not a valid UUID string. 
        # In seed we used uuid.uuid4(). 
        # Let's fix auth.py to return a stable UUID for demo user if possible, 
        # OR handle the lookup by email.
        pass # Logic handled below if we map demo-token to a real UUID in get_current_user? 
             # No, get_current_user returns dict.
             
    # Convert string ID to UUID
    try:
        uuid_id = uuid.UUID(user_id)
    except ValueError:
        # If it's the "demo-user-id" string and not a UUID, we need to map it.
        # In seed script: id=demo_user_id (which was a random UUID). 
        # We need a stable UUID for demo user if we want this to work consistently.
        # Let's fetch by email for demo user.
        if payload.get("email") == "demo@example.com":
             profile = session.exec(select(Profile).where(Profile.email == "demo@example.com")).first()
             if profile: return profile
        
        raise HTTPException(status_code=400, detail="Invalid User ID format")

    profile = session.get(Profile, uuid_id)
    
    if not profile:
        # Lazy Create (Sync)
        # Extract info from payload
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        display_name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
        avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")
        
        profile = Profile(
            id=uuid_id,
            email=email,
            display_name=display_name,
            avatar_url=avatar_url,
            role="user"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)
        


def get_optional_profile(
    payload: Optional[dict] = Depends(get_optional_user),
    session: Session = Depends(get_session)
):
    """
    Returns the Profile object if user is authenticated, otherwise None.
    """
    if not payload:
        return None
        
    user_id = payload.get("sub")
    if not user_id:
        return None

    # Handle Demo Mode special UUID
    if user_id == "demo-user-id":
        if payload.get("email") == "demo@example.com":
             profile = session.exec(select(Profile).where(Profile.email == "demo@example.com")).first()
             if profile: return profile
        return None

    try:
        uuid_id = uuid.UUID(user_id)
    except ValueError:
        return None

    return session.get(Profile, uuid_id)

def get_current_admin_profile(profile: Profile = Depends(get_current_profile)):
    if profile.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    return profile
