"""
Supabase Database Connection for BeeYield
===========================================
REWRITTEN: Now routes ALL database operations through the Rust + Go database gateway.
- Rust service (port 9091): Handles core Supabase REST CRUD with connection pooling
- Go gateway (port 9090):   Routes + handles ClickHouse analytics + JWT auth

ALL configuration comes from environment variables. ZERO hardcoded data.
"""
import httpx
import asyncio
import os
from typing import Optional, Any, List, Dict
from app.core.config import settings

# Gateway URL from environment — no hardcoded defaults for production
DB_GATEWAY_URL = settings.DB_GATEWAY_URL

# ============ LAZY SUPABASE SDK (kept for auth endpoints only) ============
_supabase_client = None
_sdk_import_failed = False


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

    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

    if not url or not key:
        print("[WARNING] SUPABASE_URL or SUPABASE_KEY not configured")
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
    """Helper to send request to gateway with ephemeral async client."""
    try:
        if token:
            payload["token"] = token
            
        async with httpx.AsyncClient(base_url=DB_GATEWAY_URL, timeout=15.0) as client:
            if endpoint == "/db/delete":
                # DELETE often requires body, so we use build_request
                request = client.build_request("DELETE", endpoint, json=payload)
                response = await client.send(request)
            elif endpoint == "/db/update":
                response = await client.patch(endpoint, json=payload)
            else:
                response = await client.post(endpoint, json=payload)
                
            return response.json()
    except Exception as e:
        return {"success": False, "error": str(e)}


async def db_insert(table: str, data: dict[str, Any], token: Optional[str] = None) -> dict[str, Any]:
    """Insert a record via the Rust/Go gateway."""
    payload = {"table": table, "data": _serialize_data(data)}
    return await _request_gateway("/db/insert", payload, token)


async def db_select(
    table: str,
    columns: str = "*",
    filters: Optional[dict[str, Any]] = None,
    limit: int = 1000,
    order_by: Optional[str] = None,
    ascending: bool = True,
    token: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Select records via the Rust/Go gateway."""
    payload = {"table": table, "columns": columns, "limit": limit}
    if filters:
        # Serialize filter values to strings for PostgREST
        serialized_filters = {}
        for key, value in filters.items():
            if isinstance(value, (list, tuple)):
                serialized_filters[key] = [str(v) for v in value]
            elif isinstance(value, str) and "." in value and any(
                value.startswith(op) for op in [
                    "eq.", "neq.", "gt.", "lt.", "gte.", "lte.",
                    "like.", "ilike.", "is.", "in.", "cs.", "cd.",
                ]
            ):
                serialized_filters[key] = value
            else:
                serialized_filters[key] = str(value)
        payload["filters"] = serialized_filters
    if order_by:
        payload["order_by"] = order_by
        payload["ascending"] = ascending
        
    res = await _request_gateway("/db/select", payload, token)
    if isinstance(res, list):
        return res
    return []


async def db_update(
    table: str,
    data: dict[str, Any],
    filters: dict[str, Any],
    token: Optional[str] = None,
) -> dict[str, Any]:
    """Update records via the Rust/Go gateway."""
    str_filters = {k: str(v) for k, v in filters.items()}
    payload = {"table": table, "data": _serialize_data(data), "filters": str_filters}
    return await _request_gateway("/db/update", payload, token)


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
    """Upsert a record via the Rust/Go gateway."""
    payload = {
        "table": table,
        "data": _serialize_data(data),
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
# Allow both sync and async usage from existing Python code.


def get_client():
    """Return the lazy Supabase SDK client (or None). For auth compatibility."""
    return get_supabase()


def _sync_wrapper(async_func):
    """Wrap an async function so calling from sync code runs it."""
    def wrapper(*args, **kwargs):
        try:
            asyncio.get_running_loop()
            return async_func(*args, **kwargs)
        except RuntimeError:
            return asyncio.run(async_func(*args, **kwargs))
    return wrapper


# Apply sync-wrapper to all helpers so legacy sync scripts work.
db_insert = _sync_wrapper(db_insert)
db_select = _sync_wrapper(db_select)
db_update = _sync_wrapper(db_update)
db_delete = _sync_wrapper(db_delete)
db_upsert = _sync_wrapper(db_upsert)
db_get_by_id = _sync_wrapper(db_get_by_id)
