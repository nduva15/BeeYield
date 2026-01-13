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
    Specifically designed to work with Supabase JWTs.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # If we have a Supabase JWT secret, use it to verify the signature.
        # Otherwise, we might be in development and skip signature verification (CAUTION)
        # SUPABASE_JWT_SECRET is the signing key used by Supabase Auth
        jwt_secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY
        
        payload = jwt.decode(
            token, 
            jwt_secret, 
            algorithms=[ALGORITHM],
            options={"verify_aud": False} # Supabase uses "authenticated" as aud
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception
