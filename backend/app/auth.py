import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlmodel import Session, select
import uuid
import base64

from app.database import get_session
from app.models import Profile

# Security scheme
security = HTTPBearer()

# Environment variable for Supabase JWT Secret
# This is crucial for verifying the token signature
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

# Logger configuration
LOG_FILE = r"d:\cback\backend\auth_debug_v2.log"

def log_debug(message: str):
    try:
        with open(LOG_FILE, "a") as f:
            f.write(f"{message}\n")
    except:
        pass

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Decodes the JWT token from Supabase and returns the user payload.
    Supports both HS256 (symmetric secret) and ES256/RS256 (JWKS).
    """
    token = credentials.credentials
    
    # Allow Demo Token for Guest Mode (Only if enabled)
    enable_demo = os.environ.get("ENABLE_DEMO_MODE", "false").lower() == "true"
    if token == "demo-token" and enable_demo:
        return {
            "sub": "demo-user-id",
            "email": "demo@example.com",
            "role": "user",
            "app_metadata": {"provider": "demo"}
        }
    
    # Start Debug Log
    log_debug(f"\n--- Request Start ---")
    log_debug(f"Token length: {len(token)}")
    
    try:
        # 1. Get Header & Alg
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get('alg')
        log_debug(f"Algorithm: {alg}")

        # 2. HS256 Verification (Symmetric Secret)
        if alg == 'HS256':
            secret_to_use = SUPABASE_JWT_SECRET
            if not secret_to_use:
                raise HTTPException(status_code=500, detail="Missing JWT Secret")
                
            try:
                # Try raw secret
                payload = jwt.decode(token, secret_to_use, algorithms=['HS256'], audience="authenticated")
                log_debug("SUCCESS: Verified with raw secret (HS256)")
            except jwt.InvalidSignatureError:
                # Try base64 decoded secret
                try:
                    decoded_secret = base64.b64decode(SUPABASE_JWT_SECRET)
                    payload = jwt.decode(token, decoded_secret, algorithms=['HS256'], audience="authenticated")
                    log_debug("SUCCESS: Verified with base64 secret (HS256)")
                except Exception as e:
                    log_debug(f"HS256 Verification Failed: {e}")
                    raise
            return payload

        # 3. RS256/ES256 Verification (Asymmetric / JWKS)
        elif alg in ['RS256', 'ES256']:
            # Decode unverified to get issuer
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            iss = unverified_payload.get('iss')
            if not iss:
                raise Exception("Missing 'iss' claim")
                
            # Construct JWKS URL
            jwks_url = f"{iss}/.well-known/jwks.json"
            
            # Use PyJWKClient to fetch keys
            jwks_client = jwt.PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[alg],
                audience="authenticated"
            )
            log_debug(f"SUCCESS: Token verified using JWKS ({alg})")
            return payload
            
        else:
             raise Exception(f"Unsupported algorithm: {alg}")

    except Exception as e:
        err_msg = f"AUTH ERROR: {str(e)}"
        print(err_msg)
        log_debug(err_msg)
        
        # Security: Return generic error to client
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

# We need a new security scheme with auto_error=False for optional auth
security_optional = HTTPBearer(auto_error=False)

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)):
    if not credentials:
        return None
    
    # Re-use the same logic by calling get_current_user directly logic-wise, 
    # but since it's a dependency, we can't call it easily without mocking.
    # So we duplicate the core logic or refactor. 
    # For now, let's just copy the robust logic to be safe.
    
    token = credentials.credentials
    if token == "demo-token":
        return {
            "sub": "demo-user-id",
            "email": "demo@example.com",
            "role": "user",
            "app_metadata": {"provider": "demo"}
        }

    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get('alg')

        if alg == 'HS256':
             if not SUPABASE_JWT_SECRET: return None
             try:
                return jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=['HS256'], audience="authenticated")
             except:
                try:
                    decoded = base64.b64decode(SUPABASE_JWT_SECRET)
                    return jwt.decode(token, decoded, algorithms=['HS256'], audience="authenticated")
                except: return None
        
        elif alg in ['RS256', 'ES256']:
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            iss = unverified_payload.get('iss')
            jwks_client = jwt.PyJWKClient(f"{iss}/.well-known/jwks.json")
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(token, signing_key.key, algorithms=[alg], audience="authenticated")
            
    except:
        return None
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
        raise HTTPException(status_code=400, detail="Invalid token payload: missing 'sub'")
        
    # Convert string ID to UUID
    try:
        uuid_id = uuid.UUID(user_id)
    except ValueError:
        # Handle Demo Mode or other non-UUID formats
        if payload.get("email") == "demo@example.com":
             profile = session.exec(select(Profile).where(Profile.email == "demo@example.com")).first()
             if profile: return profile
        raise HTTPException(status_code=400, detail=f"Invalid User ID format: {user_id}")

    profile = session.get(Profile, uuid_id)
    
    if not profile:
        # Lazy Create (Sync)
        email = payload.get("email")
        if not email:
            # Fallback for some providers if email is not top-level
            email = payload.get("user_metadata", {}).get("email")
            
        user_metadata = payload.get("user_metadata", {})
        display_name = (
            user_metadata.get("full_name") or 
            user_metadata.get("name") or 
            (email.split("@")[0] if email else "User")
        )
        avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")
        
        print(f"Creating new profile for {email} (ID: {uuid_id})")
        profile = Profile(
            id=uuid_id,
            email=email or "unknown@example.com",
            display_name=display_name,
            avatar_url=avatar_url,
            role="user"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)
        
    return profile
        

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
