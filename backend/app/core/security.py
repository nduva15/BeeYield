from datetime import datetime, timedelta
from typing import Optional, Union, Any, Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

ALGORITHM = "HS256"

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Verify JWT token and return user payload.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        jwt_secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY
        payload = jwt.decode(
            token, 
            jwt_secret, 
            algorithms=[ALGORITHM],
            options={"verify_aud": False}
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return payload
    except JWTError:
        if settings.DEBUG:
            # Fallback for development where SECRET_KEY might not match Supabase secret.
            # If the token itself is malformed, still return a clean 401 instead of a 500.
            try:
                payload = jwt.get_unverified_claims(token)
                user_id: str = payload.get("sub")
                if user_id is None:
                    raise credentials_exception
                return payload
            except JWTError:
                raise credentials_exception
        raise credentials_exception

def get_optional_current_user(token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False))) -> Optional[Dict[str, Any]]:
    """
    Optional user verification. Returns None instead of raising 401.
    Falls back to unverified decode in DEBUG mode.
    """
    if not token:
        return None
    try:
        jwt_secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY
        payload = jwt.decode(
            token, 
            jwt_secret, 
            algorithms=[ALGORITHM],
            options={"verify_aud": False}
        )
        return payload
    except JWTError:
        if settings.DEBUG:
            try:
                return jwt.get_unverified_claims(token)
            except JWTError:
                return None
        return None
