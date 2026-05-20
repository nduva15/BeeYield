from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.db.supabase_db import db_select, db_upsert, get_supabase
from typing import Literal, Optional

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

AuthBackend = Literal["shop", "beeyield", "ceba"]

PROFILE_TABLES = {
    "shop": "shop_profiles",
    "beeyield": "beeyield_profiles",
    "ceba": "profiles",
}

class BackendRegister(BaseModel):
    user_id: Optional[str] = None
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "user"
    auth_backend: AuthBackend
    metadata: Optional[dict] = None

class BackendVerify(BaseModel):
    backend: AuthBackend
    email: EmailStr

class BackendLogout(BaseModel):
    backend: AuthBackend

def _profile_payload(payload: BackendRegister) -> dict:
    if not payload.user_id:
        raise HTTPException(status_code=400, detail="user_id is required for backend profile sync")

    base = {
        "id": payload.user_id,
        "email": str(payload.email),
        "first_name": payload.first_name,
        "last_name": payload.last_name,
    }

    if payload.auth_backend == "beeyield":
        base["is_professional"] = True
    elif payload.auth_backend == "ceba":
        base["role"] = "super_admin" if payload.role == "super_admin" else "admin"

    return {key: value for key, value in base.items() if value is not None}

@router.post("/register", response_model=dict)
def register(user_in: UserCreate):
    print(f"DEBUG: Registering user {user_in.email}")
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
        
    except Exception:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

@router.post("/register-backend", response_model=dict)
async def register_backend(payload: BackendRegister):
    table = PROFILE_TABLES[payload.auth_backend]
    result = await db_upsert(table, _profile_payload(payload), on_conflict="id")

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error") or "Backend profile sync failed")

    rows = result.get("data") or []
    row = rows[0] if isinstance(rows, list) and rows else result.get("data")
    return {
        "id": payload.user_id,
        "email": str(payload.email),
        "backend": payload.auth_backend,
        "role": payload.role,
        "profile": row,
    }

@router.get("/verify", response_model=dict)
async def verify_backend(backend: AuthBackend, email: EmailStr):
    table = PROFILE_TABLES[backend]
    columns = "id,email,role" if backend == "ceba" else "id,email"
    rows = await db_select(table, columns=columns, filters={"email": str(email)}, limit=1)
    profile = rows[0] if rows else None
    return {
        "exists": profile is not None,
        "backend": backend,
        "email": str(email),
        "role": profile.get("role") if profile else None,
    }

@router.post("/logout-backend", response_model=dict)
async def logout_backend(payload: BackendLogout):
    return {"success": True, "backend": payload.backend}
