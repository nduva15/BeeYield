"""
Supabase Database Connection for BeeYield
Primary database for all transactional data
"""
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
from app.core.config import settings

# Global Supabase client
_supabase_client: Optional[Client] = None


def get_supabase() -> Optional[Client]:
    """Get or create Supabase client connection"""
    global _supabase_client
    
    if _supabase_client is None:
        try:
            url = settings.SUPABASE_URL
            key = settings.SUPABASE_KEY
            if url and key:
                _supabase_client = create_client(url, key)
                print(f"✅ Connected to Supabase: {url}")
            else:
                print("⚠️ Supabase credentials not configured")
        except Exception as e:
            print(f"⚠️ Supabase connection failed: {e}")
            _supabase_client = None
    
    return _supabase_client


# ============ HELPER FUNCTIONS ============

def db_insert(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a record into a table"""
    supabase = get_supabase()
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
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100,
    order_by: Optional[str] = None,
    ascending: bool = True
) -> List[Dict[str, Any]]:
    """Select records from a table"""
    supabase = get_supabase()
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
            print(f"DB Select Error: {e}")
            return []
    return []


def db_update(table: str, data: Dict[str, Any], filters: Dict[str, Any]) -> Dict[str, Any]:
    """Update records in a table"""
    supabase = get_supabase()
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


def db_delete(table: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    """Delete records from a table"""
    supabase = get_supabase()
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


def db_upsert(table: str, data: Dict[str, Any], on_conflict: str = "id") -> Dict[str, Any]:
    """Upsert (insert or update) a record"""
    supabase = get_supabase()
    if supabase:
        try:
            result = supabase.table(table).upsert(data, on_conflict=on_conflict).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    return {"success": False, "error": "Database not connected"}


def db_get_by_id(table: str, id: str, id_column: str = "id") -> Optional[Dict[str, Any]]:
    """Get a single record by ID"""
    supabase = get_supabase()
    if supabase:
        try:
            result = supabase.table(table).select("*").eq(id_column, id).single().execute()
            return result.data
        except Exception as e:
            print(f"DB Get Error: {e}")
            return None
    return None

