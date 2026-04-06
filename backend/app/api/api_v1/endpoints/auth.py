from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.db.supabase_db import get_supabase
from app.core.config import settings
from typing import Optional, Any, Dict
import httpx

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "customer"
    metadata: Optional[Dict[str, Any]] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=dict)
async def register(user_in: UserCreate):
    print(f"DEBUG: Registering user {user_in.email}")

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Server auth configuration is incomplete")

    metadata = {
        "first_name": user_in.first_name,
        "last_name": user_in.last_name,
        "role": user_in.role,
        **(user_in.metadata or {}),
    }
    metadata = {k: v for k, v in metadata.items() if v is not None}

    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "email": user_in.email,
        "password": user_in.password,
        "email_confirm": True,
        "user_metadata": metadata,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users",
                json=payload,
                headers=headers,
            )

        if response.status_code >= 400:
            detail = "Registration failed"
            try:
                error_payload = response.json()
                detail = (
                    error_payload.get("msg")
                    or error_payload.get("message")
                    or error_payload.get("error_description")
                    or error_payload.get("error")
                    or detail
                )
            except Exception:
                detail = response.text or detail

            status_code = 409 if response.status_code == 422 else response.status_code
            raise HTTPException(status_code=status_code, detail=detail)

        body = response.json()
        return {
            "message": "User registered successfully.",
            "user_id": body.get("id"),
            "email_confirmed": True,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
def login(user_in: UserLogin):
    supabase = get_supabase()
    
    try:
        res = supabase.auth.sign_in_with_password({
            "email": user_in.email,
            "password": user_in.password
        })
        
        if not res.session:
             raise HTTPException(status_code=401, detail="Invalid credentials")
             
        # We can return Supabase's token or generate our own wrapping it.
        # Returning Supabase's access token directly for simplicity in this MVP.
        return {
            "access_token": res.session.access_token,
            "token_type": "bearer"
        }
        
    except Exception:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
