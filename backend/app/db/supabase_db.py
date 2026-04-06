"""
Supabase Database Connection for BeeYield
===========================================
REWRITTEN: Now routes ALL database operations through the Rust + Go database gateway.
- Rust service (port 9091): Handles core Supabase REST CRUD with connection pooling
- Go gateway (port 9090):   Routes + handles JWT auth

ALL configuration comes from environment variables. ZERO hardcoded data.
"""
import httpx
from typing import Optional, Any
from app.core.config import settings
from contextlib import contextmanager

# Gateway URL from environment — no hardcoded defaults for production
DB_GATEWAY_URL = settings.DB_GATEWAY_URL

@contextmanager
def get_python_context():
    """Provides a reference for Rust to call back into Python safely."""
    yield None

# ============ LAZY SUPABASE SDK (kept for auth endpoints only) ============
_supabase_client = None
_sdk_import_failed = False

# ============ SHARED HTTP CLIENT (Connection Pooling) ============
_async_client: Optional[httpx.AsyncClient] = None

def init_db_client():
    """Initialize the shared AsyncClient. Call this on app startup."""
    global _async_client
    if _async_client is None:
        _async_client = httpx.AsyncClient(
            timeout=15.0, 
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
        )
        print("[DB] Shared HTTP client initialized.")

async def close_db_client():
    """Close the shared AsyncClient. Call this on app shutdown."""
    global _async_client
    if _async_client:
        await _async_client.aclose()
        _async_client = None
        print("[DB] Shared HTTP client closed.")

async def _execute_request(method: str, url: str, **kwargs) -> httpx.Response:
    """
    Execute an HTTP request using the shared client if available,
    otherwise create a temporary client (fallback for scripts).
    """
    global _async_client
    if _async_client and not _async_client.is_closed:
        return await _async_client.request(method, url, **kwargs)
    
    # Fallback for one-off scripts
    async with httpx.AsyncClient(timeout=15.0) as client:
        return await client.request(method, url, **kwargs)


def _lazy_import_sdk():
    """Import Supabase SDK lazily — only needed for auth sign-up/sign-in."""
    global _sdk_import_failed
    if _sdk_import_failed:
        return None, None
    try:
        from supabase import create_client, Client
        return create_client, Client
    except Exception as e:
        print(f"[WARNING] Supabase SDK import failed: {e}")
        _sdk_import_failed = True
        return None, None


def get_supabase():
    """Compatibility function — lazily creates Supabase SDK client for auth only."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY

    if not url or not key:
        print("[WARNING] settings.SUPABASE_URL or settings.SUPABASE_KEY not configured")
        return None

    create_client, _ = _lazy_import_sdk()
    if create_client is None:
        return None
    try:
        _supabase_client = create_client(url, key)
        return _supabase_client
    except Exception as e:
        print(f"[WARNING] Supabase client creation failed: {e}")
        return None


# ============ DATABASE HELPER FUNCTIONS ============
# All operations go through the Rust/Go gateway — no direct Supabase calls.

async def _request_gateway(endpoint: str, payload: dict, token: Optional[str] = None) -> dict:
    """Helper to send request to gateway."""
    try:
        if token:
            payload["token"] = token
            
        kwargs = {"json": payload}
        
        if endpoint == "/db/delete":
            # DELETE often requires body
             # httpx 'request' supports 'content' or 'json' for DELETE too
            response = await _execute_request("DELETE", f"{DB_GATEWAY_URL}{endpoint}", **kwargs)
        elif endpoint == "/db/update":
            response = await _execute_request("PATCH", f"{DB_GATEWAY_URL}{endpoint}", **kwargs)
        else:
            response = await _execute_request("POST", f"{DB_GATEWAY_URL}{endpoint}", **kwargs)
        
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        error_msg = f"Gateway {endpoint} failed: {e.response.status_code} - {e.response.text}"
        print(f"[ERROR] {error_msg}")
        return {"success": False, "error": error_msg}
    except Exception as e:
        print(f"[ERROR] Gateway {endpoint} request failed: {str(e)}")
        return {"success": False, "error": str(e)}


async def db_insert(table: str, data: dict[str, Any], token: Optional[str] = None) -> dict[str, Any]:
    """Insert a record via direct REST API."""
    url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
    # IMPORTANT: never use service-role as apikey for user-scoped calls.
    # apikey should be anon; Authorization should be the user JWT when present.
    apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    auth_key = token or apikey
    headers = {
        "apikey": apikey,
        "Authorization": f"Bearer {auth_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        response = await _execute_request("POST", url, json=data, headers=headers)
        response.raise_for_status()
        return {"success": True, "data": response.json()}
    except httpx.HTTPStatusError as e:
        print(f"[ERROR] REST insert failed: {e.response.status_code} - {e.response.text}")
        return {"success": False, "error": f"{e.response.status_code}: {e.response.text}"}
    except Exception as e:
        print(f"[ERROR] REST insert failed: {str(e)}")
        return {"success": False, "error": str(e)}


async def db_select(
    table: str,
    columns: str = "*",
    filters: Optional[dict[str, Any]] = None,
    limit: int = 1000,
    offset: int = 0,
    order_by: Optional[str] = None,
    ascending: bool = True,
    token: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Select records via direct REST API."""
    url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
    params = {"select": columns}
    
    if order_by:
        params["order"] = f"{order_by}.{'asc' if ascending else 'desc'}"
        
    if filters:
        for k, v in filters.items():
            if v is None:
                params[k] = "is.null"
            elif isinstance(v, (list, tuple)):
                v_clean = [i for i in v if i is not None]
                if v_clean:
                    v_list = ",".join([str(i) for i in v_clean])
                    params[k] = f"in.({v_list})"
                else:
                    params[k] = "is.null"
            else:
                params[k] = f"eq.{v}"
            
    apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    headers = {
        "apikey": apikey,
        "Authorization": f"Bearer {token or apikey}",
        "Range": f"{offset}-{offset + limit - 1}" if limit else "0-999",
    }
    
    try:
        response = await _execute_request("GET", url, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        print(f"[ERROR] REST select failed: {e.response.status_code}")
        print(f"  URL: {url}")
        print(f"  Params: {params}")
        print(f"  Response: {e.response.text}")
        return []
    except Exception as e:
        print(f"[ERROR] REST select failed: {str(e)}")
        print(f"  URL: {url}")
        print(f"  Params: {params}")
        return []

def db_select_sync(
    table: str,
    columns: str = "*",
    filters: Optional[dict[str, Any]] = None,
    limit: int = 1000,
    token: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Synchronous select for Rust core."""
    url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
    params = {"select": columns}
    if filters:
        for k, v in filters.items():
            params[k] = f"eq.{v}"
            
    apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    headers = {
        "apikey": apikey,
        "Authorization": f"Bearer {token or apikey}",
        "Range": f"0-{limit-1}" if limit else "0-999",
    }
    
    with httpx.Client(timeout=10.0) as client:
        try:
            response = client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[ERROR] Sync select failed: {e}")
            return []

def db_insert_sync(table: str, data: dict[str, Any], token: Optional[str] = None) -> dict[str, Any]:
    """Synchronous insert for Rust core."""
    url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
    apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    headers = {
        "apikey": apikey,
        "Authorization": f"Bearer {token or apikey}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    with httpx.Client(timeout=10.0) as client:
        try:
            response = client.post(url, json=data, headers=headers)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            print(f"[ERROR] Sync insert failed: {e}")
            return {"success": False, "error": str(e)}


async def db_update(
    table: str,
    data: dict[str, Any],
    filters: dict[str, Any],
    token: Optional[str] = None,
) -> dict[str, Any]:
    """Update records via the Rust/Go gateway, with direct REST and SDK fallbacks."""
    str_filters = {k: str(v) for k, v in filters.items()}
    serialized_data = _serialize_data(data)
    payload = {"table": table, "data": serialized_data, "filters": str_filters}
    res = await _request_gateway("/db/update", payload, token)
    
    if not res.get("success"):
        url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
        params: dict[str, str] = {}
        for k, v in filters.items():
            if v is None:
                params[k] = "is.null"
            elif isinstance(v, (list, tuple)):
                v_clean = [i for i in v if i is not None]
                if v_clean:
                    params[k] = f"in.({','.join([str(i) for i in v_clean])})"
                else:
                    params[k] = "is.null"
            else:
                params[k] = f"eq.{v}"

        apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
        headers = {
            "apikey": apikey,
            "Authorization": f"Bearer {token or apikey}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        try:
            response = await _execute_request("PATCH", url, params=params, json=serialized_data, headers=headers)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except httpx.HTTPStatusError as e:
            print(f"[ERROR] REST update fallback failed: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            print(f"[ERROR] REST update fallback failed: {str(e)}")

        supabase = get_supabase()
        if supabase:
            try:
                query = supabase.table(table).update(data)
                for k, v in filters.items():
                    query = query.eq(k, v)
                response = query.execute()
                return {"success": True, "data": response.data}
            except Exception as e:
                print(f"[ERROR] SDK update fallback failed: {str(e)}")
                return {"success": False, "error": f"Gateway and SDK update failed: {str(e)}"}
    return res


async def db_delete(
    table: str, filters: dict[str, Any], token: Optional[str] = None
) -> dict[str, Any]:
    """Delete records via the Rust/Go gateway."""
    str_filters = {k: str(v) for k, v in filters.items()}
    payload = {"table": table, "filters": str_filters}
    return await _request_gateway("/db/delete", payload, token)


async def db_upsert(
    table: str,
    data: dict[str, Any],
    on_conflict: str = "id",
    token: Optional[str] = None,
) -> dict[str, Any]:
    """Upsert a record via direct REST API."""
    url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
    
    # Add on_conflict to URL parameters
    params = {"on_conflict": on_conflict}
    
    apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    headers = {
        "apikey": apikey,
        "Authorization": f"Bearer {token or apikey}",
        "Content-Type": "application/json",
        "Prefer": "return=representation,resolution=merge-duplicates",
    }
    
    # Ensure data is serialized
    serialized_data = _serialize_data(data)
    
    try:
        response = await _execute_request("POST", url, json=serialized_data, headers=headers, params=params)
        response.raise_for_status()
        return {"success": True, "data": response.json()}
    except Exception as e:
        print(f"[ERROR] REST upsert failed: {e}")
        # Try fall back to gateway if REST fails (though gateway is likely down)
        payload = {
            "table": table,
            "data": serialized_data,
            "on_conflict": on_conflict,
        }
        return await _request_gateway("/db/upsert", payload, token)


async def db_get_by_id(
    table: str,
    id: str,
    id_column: str = "id",
    token: Optional[str] = None,
) -> Optional[dict[str, Any]]:
    """Get a single record by ID via the Rust/Go gateway."""
    payload = {"table": table, "id": str(id), "id_column": id_column}
    res = await _request_gateway("/db/get-by-id", payload, token)
    if res and res != "null" and res is not None and isinstance(res, dict):
        return res
    return None

async def db_rpc(
    function_name: str,
    params: Optional[dict[str, Any]] = None,
    token: Optional[str] = None
) -> Any:
    """Call a Postgres RPC function."""
    url = f"{settings.SUPABASE_URL}/rest/v1/rpc/{function_name}"
    apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    headers = {
        "apikey": apikey,
        "Authorization": f"Bearer {token or apikey}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    
    try:
        response = await _execute_request("POST", url, json=params or {}, headers=headers)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        print(f"[ERROR] RPC {function_name} failed: {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        print(f"[ERROR] RPC {function_name} failed: {str(e)}")
        return None

# ============ SERIALIZATION HELPERS ============

def _serialize_value(v):
    """Convert non-JSON-serializable types to strings."""
    from uuid import UUID
    from datetime import date, datetime

    if isinstance(v, UUID):
        return str(v)
    if isinstance(v, (date, datetime)):
        return v.isoformat()
    if isinstance(v, dict):
        return {k: _serialize_value(val) for k, val in v.items()}
    if isinstance(v, (list, tuple)):
        return [_serialize_value(item) for item in v]
    return v


def _serialize_data(data: dict) -> dict:
    """Ensure all values in data dict are JSON-serializable."""
    return {k: _serialize_value(v) for k, v in data.items()}


# ============ COMPATIBILITY SHIMS ============
# Removed sync wrappers to ensure proper async behavior in FastAPI.
# Legacy sync scripts should use asyncio.run(db_select(...)) instead.

def get_client():
    """Return the lazy Supabase SDK client (or None). For auth compatibility."""
    return get_supabase()
