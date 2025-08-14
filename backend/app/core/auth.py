from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, List
import jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.models.models import User, TokenPayload
from app.core.permissions import PermissionChecker


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"


def create_access_token(
    subject: str | Any, 
    expires_delta: timedelta | None = None,
    user_context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Create access token with optional user context (roles, permissions)
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Base payload
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # Add ATS context if provided
    if user_context:
        to_encode.update({
            "roles": user_context.get("roles", []),
            "permissions": user_context.get("permissions", []),
            "primary_role": user_context.get("primary_role"),
        })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def decode_token(token: str) -> TokenPayload:
    """
    Decode JWT token and return payload with ATS claims
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract ATS-specific claims
        roles = payload.get("roles", [])
        permissions = payload.get("permissions", [])
        primary_role = payload.get("primary_role")
        
        token_data = TokenPayload(
            sub=payload.get("sub"),
            roles=roles,
            permissions=permissions,
            primary_role=primary_role
        )
        return token_data
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def create_access_token_for_user(user: User, db_session) -> str:
    """
    Create access token with user's current roles and permissions
    """
    from app.core.permissions import get_user_context
    
    # Get user context with roles and permissions
    user_context = get_user_context(user, db_session)
    
    # Create token with role claims
    access_token = create_access_token(
        subject=user.id,
        user_context=user_context
    )
    
    return access_token


def refresh_user_token(user: User, db_session) -> str:
    """
    Refresh user token with updated roles and permissions
    This is useful when user roles change and need to update the token
    """
    return create_access_token_for_user(user, db_session)


def extract_permissions_from_token(token: str) -> List[str]:
    """
    Extract permissions from JWT token
    """
    try:
        token_data = decode_token(token)
        return token_data.permissions or []
    except ValueError:
        return []


def extract_roles_from_token(token: str) -> List[str]:
    """
    Extract roles from JWT token
    """
    try:
        token_data = decode_token(token)
        # Convert role objects to names if needed
        roles = token_data.roles or []
        if roles and isinstance(roles[0], dict):
            return [role["name"] for role in roles]
        return roles
    except ValueError:
        return []


def get_primary_role_from_token(token: str) -> Optional[str]:
    """
    Get primary role from JWT token
    """
    try:
        token_data = decode_token(token)
        return token_data.primary_role
    except ValueError:
        return None


def validate_token_permissions(token: str, required_permissions: List[str]) -> bool:
    """
    Validate that token has required permissions
    """
    try:
        token_permissions = extract_permissions_from_token(token)
        return all(perm in token_permissions for perm in required_permissions)
    except ValueError:
        return False


def validate_token_roles(token: str, required_roles: List[str]) -> bool:
    """
    Validate that token has any of the required roles
    """
    try:
        token_roles = extract_roles_from_token(token)
        return any(role in token_roles for role in required_roles)
    except ValueError:
        return False


# Token refresh utilities
def should_refresh_token(token: str, refresh_threshold_minutes: int = 30) -> bool:
    """
    Check if token should be refreshed (close to expiry)
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[ALGORITHM],
            options={"verify_exp": False}  # Don't verify expiry for this check
        )
        
        exp_timestamp = payload.get("exp")
        if not exp_timestamp:
            return True
        
        exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        time_until_expiry = exp_datetime - datetime.now(timezone.utc)
        
        return time_until_expiry.total_seconds() < (refresh_threshold_minutes * 60)
        
    except jwt.InvalidTokenError:
        return True


def get_token_expiry(token: str) -> Optional[datetime]:
    """
    Get token expiry datetime
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": False}
        )
        
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            return datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        return None
        
    except jwt.InvalidTokenError:
        return None


# Security utilities
def generate_password_reset_token(email: str) -> str:
    """
    Generate password reset token
    """
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email}, 
        settings.SECRET_KEY, 
        algorithm=ALGORITHM
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify password reset token and return email
    """
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return str(decoded_token["sub"])
    except jwt.InvalidTokenError:
        return None


# ATS-specific token utilities
def create_invitation_token(
    email: str, 
    role_id: str, 
    invited_by: str,
    expires_hours: int = 24
) -> str:
    """
    Create invitation token for user role assignment
    """
    delta = timedelta(hours=expires_hours)
    now = datetime.now(timezone.utc)
    expires = now + delta
    
    payload = {
        "exp": expires,
        "nbf": now,
        "sub": email,
        "role_id": role_id,
        "invited_by": invited_by,
        "token_type": "invitation"
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_invitation_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify invitation token and return invitation data
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("token_type") != "invitation":
            return None
            
        return {
            "email": payload["sub"],
            "role_id": payload["role_id"],
            "invited_by": payload["invited_by"]
        }
    except jwt.InvalidTokenError:
        return None