"""
Supabase Database Connection for BeeYield
High-performance httpx implementation to avoid gRPC/DNS hangs in library.
"""
import httpx
import json
import os
from typing import Optional, Any, List, Dict
from app.core.config import settings

# Global client for connection pooling
_http_client: Optional[httpx.Client] = None

from supabase import create_client, Client
from app.core.config import settings

# Primary client (legacy/compatibility)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase():
    """Compatibility function to match old Supabase client-like behavior"""
    return supabase

def get_supabase_admin():
    """Compatibility function to match old Supabase admin behavior"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY)

def get_client() -> httpx.Client:
    global _http_client
    if _http_client is None:
        _http_client = httpx.Client(
            base_url=f"{settings.SUPABASE_URL}/rest/v1",
            headers={
                "apikey": settings.SUPABASE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            timeout=10.0
        )
    return _http_client

def get_admin_headers() -> Dict[str, str]:
    return {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

# ============ HELPER FUNCTIONS ============

def db_insert(table: str, data: dict[str, Any]) -> dict[str, Any]:
    """Insert a record via REST API"""
    try:
        client = get_client()
        headers = get_admin_headers()
        response = client.post(f"/{table}", json=data, headers=headers)
        
        if response.status_code in [200, 201]:
            return {"success": True, "data": response.json()}
        else:
            return {"success": False, "error": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

def db_select(
    table: str, 
    columns: str = "*",
    filters: Optional[dict[str, Any]] = None,
    limit: int = 100,
    order_by: Optional[str] = None,
    ascending: bool = True
) -> list[dict[str, Any]]:
    """Select records via REST API"""
    try:
        client = get_client()
        params = {"select": columns, "limit": limit}
        
        if filters:
            for key, value in filters.items():
                if isinstance(value, (list, tuple)):
                    # Handle IN filter: in.(val1,val2,...)
                    val_str = ",".join([str(v) for v in value])
                    params[key] = f"in.({val_str})"
                elif isinstance(value, str) and "." in value and any(value.startswith(op) for op in ["eq.", "neq.", "gt.", "lt.", "gte.", "lte.", "like.", "ilike.", "is.", "in.", "cs.", "cd."]):
                    # Direct operator use
                    params[key] = value
                else:
                    # Default EQ
                    params[key] = f"eq.{value}"
        
        if order_by:
            params["order"] = f"{order_by}.{'asc' if ascending else 'desc'}"
            
        response = client.get(f"/{table}", params=params, headers=get_admin_headers())
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"DB Select Error for {table}: {response.text}")
            return []
    except Exception as e:
        print(f"DB Select Exception for {table}: {e}")
        return []

def db_update(table: str, data: dict[str, Any], filters: dict[str, Any]) -> dict[str, Any]:
    """Update records via REST API"""
    try:
        client = get_client()
        params = {}
        for key, value in filters.items():
            params[key] = f"eq.{value}"
            
        response = client.patch(f"/{table}", json=data, params=params, headers=get_admin_headers())
        
        if response.status_code in [200, 204]:
            return {"success": True, "data": response.json() if response.text else []}
        else:
            return {"success": False, "error": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

def db_delete(table: str, filters: dict[str, Any]) -> dict[str, Any]:
    """Delete records via REST API"""
    try:
        client = get_client()
        params = {}
        for key, value in filters.items():
            params[key] = f"eq.{value}"
            
        response = client.delete(f"/{table}", params=params, headers=get_admin_headers())
        
        if response.status_code in [200, 204]:
            return {"success": True}
        else:
            return {"success": False, "error": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

def db_upsert(table: str, data: dict[str, Any], on_conflict: str = "id") -> dict[str, Any]:
    """Upsert a record via REST API (uses Resolution header)"""
    try:
        client = get_client()
        headers = get_admin_headers()
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        
        response = client.post(f"/{table}", json=data, headers=headers)
        
        if response.status_code in [200, 201]:
            return {"success": True, "data": response.json()}
        else:
            return {"success": False, "error": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

def db_get_by_id(table: str, id: str, id_column: str = "id") -> Optional[dict[str, Any]]:
    """Get a single record by ID"""
    results = db_select(table, filters={id_column: id}, limit=1)
    return results[0] if results else None
