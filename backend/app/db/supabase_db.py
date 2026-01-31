"""
Supabase Database Connection for BeeYield
Primary database for all transactional data
"""
from supabase import create_client, Client
from typing import Optional, Any
from app.core.config import settings

# ... (existing imports)
# Global Supabase client
_supabase_client: Optional[Client] = None

# Apply DNS Patch to handle getaddrinfo failures
try:
    import sys
    import os
    # Add project root to path
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    from dns_fix import patch_dns
    patch_dns()
except:
    pass


def get_supabase() -> Optional[Client]:
    """Get or create Supabase client connection"""
    global _supabase_client
    
    if _supabase_client is None:
        try:
            url = settings.SUPABASE_URL
            key = settings.SUPABASE_KEY
            if url and key:
                # Create client with timeout options
                _supabase_client = create_client(url, key, options={
                    "postgrest_client_timeout": 10,  # 10 second timeout
                    "storage_client_timeout": 10,
                })
                print(f"OK: Connected to Supabase: {url}")
            else:
                print("WARNING: Supabase credentials not configured - using mock data")
        except Exception as e:
            if "401" in str(e) or "Unauthorized" in str(e) or "Invalid API key" in str(e):
                print(f"CRITICAL ERROR: Supabase API Key is INVALID (401 Unauthorized). Check your SUPABASE_KEY in .env")
            elif "timeout" in str(e).lower() or "timed out" in str(e).lower():
                print(f"WARNING: Supabase connection timed out - using mock data: {e}")
            else:
                print(f"WARNING: Supabase connection failed - using mock data: {e}")
            _supabase_client = None
    
    return _supabase_client


# Global Supabase Admin client (Service Role)
_supabase_admin_client: Optional[Client] = None

def get_supabase_admin() -> Optional[Client]:
    """Get or create Supabase Admin client connection (Service Role)"""
    global _supabase_admin_client
    
    if _supabase_admin_client is None:
        try:
            url = settings.SUPABASE_URL
            key = settings.SUPABASE_SERVICE_ROLE_KEY
            if url and key:
                _supabase_admin_client = create_client(url, key)
                print(f"OK: Connected to Supabase Admin: {url}")
            else:
                print("WARNING: Supabase Service Role credentials not configured")
        except Exception as e:
            print(f"ERROR: Supabase Admin connection failed: {e}")
            _supabase_admin_client = None
            
    return _supabase_admin_client


# ============ HELPER FUNCTIONS ============

def db_insert(table: str, data: dict[str, Any]) -> dict[str, Any]:
    """Insert a record into a table"""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            result = supabase.table(table).insert(data).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    return {"success": False, "error": "Database not connected"}


def db_select(
    table: str, 
    columns: str = "*",
    filters: Optional[dict[str, Any]] = None,
    limit: int = 100,
    order_by: Optional[str] = None,
    ascending: bool = True
) -> list[dict[str, Any]]:
    """Select records from a table"""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            query = supabase.table(table).select(columns)
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            if order_by:
                query = query.order(order_by, desc=not ascending)
            
            query = query.limit(limit)
            result = query.execute()
            return result.data or []
        except Exception as e:
            error_msg = str(e).lower()
            if "timeout" in error_msg or "timed out" in error_msg:
                print(f"DB Select Timeout for {table}: Connection timed out, using fallback data")
            else:
                print(f"DB Select Error for {table}: {e}")
            return []
    print(f"DB Select: No database connection, returning empty for {table}")
    return []


def db_update(table: str, data: dict[str, Any], filters: dict[str, Any]) -> dict[str, Any]:
    """Update records in a table"""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            query = supabase.table(table).update(data)
            for key, value in filters.items():
                query = query.eq(key, value)
            result = query.execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    return {"success": False, "error": "Database not connected"}


def db_delete(table: str, filters: dict[str, Any]) -> dict[str, Any]:
    """Delete records from a table"""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            query = supabase.table(table).delete()
            for key, value in filters.items():
                query = query.eq(key, value)
            result = query.execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    return {"success": False, "error": "Database not connected"}


def db_upsert(table: str, data: dict[str, Any], on_conflict: str = "id") -> dict[str, Any]:
    """Upsert (insert or update) a record"""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            result = supabase.table(table).upsert(data, on_conflict=on_conflict).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    return {"success": False, "error": "Database not connected"}


def db_get_by_id(table: str, id: str, id_column: str = "id") -> Optional[dict[str, Any]]:
    """Get a single record by ID"""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            result = supabase.table(table).select("*").eq(id_column, id).single().execute()
            return result.data
        except Exception as e:
            print(f"DB Get Error: {e}")
            return None
    return None

