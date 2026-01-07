from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.db.supabase_db import get_supabase
from app.core import security
from typing import Optional

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=dict)
def register(user_in: UserCreate):
    supabase = get_supabase()
    
    # Check if user already exists
    # If using Supabase Auth, you usually use their GoTrue client.
    # Here we are simulating a custom flow or wrapping Supabase Auth.
    # For now, let's use Supabase Auth 'sign_up'
    
    try:
        res = supabase.auth.sign_up({
            "email": user_in.email,
            "password": user_in.password,
            "options": {
                "data": {
                    "first_name": user_in.first_name,
                    "last_name": user_in.last_name,
                    "role": user_in.role
                }
            }
        })
        
        if not res.user:
            raise HTTPException(status_code=400, detail="Registration failed")
            
        return {"message": "User registered successfully. Please check email for verification."}
        
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
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
