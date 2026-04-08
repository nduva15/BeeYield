import base64
import hashlib
import hmac as hmaclib
import os
import secrets
from datetime import datetime, timezone
from typing import Any, Literal, Optional
from urllib.parse import parse_qsl

import httpx
from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.config import settings
from app.db.supabase_db import db_delete, db_insert, db_rpc, db_select, db_update, db_upsert

router = APIRouter()

SUPPORTED_PLATFORMS = {"quickbooks", "shopify", "etims"}


class IntegrationConfigPayload(BaseModel):
    platform: Literal["quickbooks", "shopify", "etims"]
    is_active: bool = True
    store_url: Optional[str] = None
    kra_pin: Optional[str] = None
    branch_code: Optional[str] = None
    device_serial: Optional[str] = None
    company_name: Optional[str] = None
    access_token: Optional[str] = None
    config_json: Optional[dict[str, Any]] = Field(default=None)


async def _get_user_id_from_jwt(user_jwt: str) -> str:
    if not user_jwt:
        raise HTTPException(status_code=401, detail="Missing Authorization token")
    if not settings.SUPABASE_URL:
        raise HTTPException(status_code=500, detail="SUPABASE_URL not configured")

    apikey = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    if not apikey:
        raise HTTPException(status_code=500, detail="SUPABASE key not configured")

    url = f"{settings.SUPABASE_URL}/auth/v1/user"
    headers = {"apikey": apikey, "Authorization": f"Bearer {user_jwt}"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")

    data = resp.json()
    uid = data.get("id")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid session")
    return uid


def _get_bearer(authorization: Optional[str]) -> str:
    return (authorization or "").replace("Bearer", "").strip()


def _normalize_platform(platform: str) -> str:
    value = str(platform or "").strip().lower()
    if value not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail="Invalid platform")
    return value


def _clean_shop_domain(shop: str) -> str:
    value = (shop or "").strip().replace("https://", "").replace("http://", "")
    value = value.split("/")[0]
    if not value or "." not in value:
        raise HTTPException(status_code=400, detail="Invalid shop domain")
    return value


def _merge_config_json(payload: IntegrationConfigPayload) -> dict[str, Any]:
    config_json = dict(payload.config_json or {})
    if payload.store_url is not None:
        config_json.setdefault("store_url", payload.store_url)
    if payload.kra_pin is not None:
        config_json["kra_pin"] = payload.kra_pin
    if payload.branch_code is not None:
        config_json["branch_code"] = payload.branch_code
    if payload.device_serial is not None:
        config_json["device_serial"] = payload.device_serial
    if payload.company_name is not None:
        config_json["company_name"] = payload.company_name
    if payload.access_token is not None:
        config_json["access_token"] = payload.access_token
    return config_json


def _build_integration_row(user_id: str, payload: IntegrationConfigPayload) -> dict[str, Any]:
    row: dict[str, Any] = {
        "user_id": user_id,
        "platform": payload.platform,
        "is_active": payload.is_active,
        "config_json": _merge_config_json(payload),
    }
    if payload.store_url is not None:
        row["store_url"] = payload.store_url
    if payload.kra_pin is not None:
        row["kra_pin"] = payload.kra_pin
    if payload.branch_code is not None:
        row["branch_code"] = payload.branch_code
    if payload.device_serial is not None:
        row["device_serial"] = payload.device_serial
    if payload.company_name is not None:
        row["company_name"] = payload.company_name
    return row


async def _get_integration_or_404(user_id: str, platform: str, bearer: str) -> dict[str, Any]:
    rows = await db_select(
        "integration_settings",
        filters={"user_id": user_id, "platform": platform},
        limit=1,
        token=bearer,
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Integration not found")
    return rows[0]


async def _write_integration_audit_log(
    *,
    user_id: str,
    platform: str,
    event_type: str,
    status: str,
    bearer: str,
    message: Optional[str] = None,
    metrics: Optional[dict[str, Any]] = None,
) -> None:
    payload = {
        "user_id": user_id,
        "platform": platform,
        "event_type": event_type,
        "status": status,
        "message": message,
        "metrics": metrics or {},
    }
    try:
        result = await db_insert("integration_audit_logs", payload, token=bearer)
        if result.get("success"):
            return
    except Exception:
        pass

    try:
        await db_rpc(
            "log_integration_event",
            {
                "p_platform": platform,
                "p_event_type": event_type,
                "p_status": status,
                "p_message": message,
                "p_metrics": metrics or {},
            },
            token=bearer,
        )
    except Exception:
        pass


async def _sync_integration_platform(user_id: str, platform: str, bearer: str) -> dict[str, Any]:
    existing = await _get_integration_or_404(user_id, platform, bearer)
    if not existing.get("is_active", False):
        raise HTTPException(status_code=400, detail=f"{platform} integration is inactive")

    now = datetime.now(timezone.utc).isoformat()
    config_json = dict(existing.get("config_json") or {})

    if platform == "quickbooks":
        metrics = {
            "synced_at": now,
            "realm_id": config_json.get("realm_id"),
            "account_mapping_ready": bool(config_json.get("account_mapping")),
        }
        message = "QuickBooks ledger sync recorded."
    elif platform == "shopify":
        metrics = {
            "synced_at": now,
            "shop": existing.get("store_url") or config_json.get("shop") or config_json.get("store_url"),
            "product_feed_ready": bool(existing.get("store_url") or config_json.get("shop") or config_json.get("store_url")),
        }
        message = "Shopify catalog sync recorded."
    else:
        metrics = {
            "synced_at": now,
            "kra_pin": existing.get("kra_pin") or config_json.get("kra_pin"),
            "device_serial": existing.get("device_serial") or config_json.get("device_serial"),
        }
        message = "eTIMS compliance sync recorded."

    config_json["last_sync_at"] = now
    config_json["last_sync_status"] = "success"
    config_json["last_sync_metrics"] = metrics

    updated = await db_update(
        "integration_settings",
        {"config_json": config_json, "updated_at": now},
        {"user_id": user_id, "platform": platform},
        token=bearer,
    )
    if not updated.get("success"):
        raise HTTPException(status_code=500, detail=updated.get("error") or f"Failed to sync {platform}")

    await _write_integration_audit_log(
        user_id=user_id,
        platform=platform,
        event_type="manual_sync",
        status="success",
        bearer=bearer,
        message=message,
        metrics=metrics,
    )

    config_rows = await db_select(
        "integration_settings",
        filters={"user_id": user_id, "platform": platform},
        limit=1,
        token=bearer,
    )
    return {
        "success": True,
        "platform": platform,
        "message": message,
        "metrics": metrics,
        "config": config_rows[0] if config_rows else {**existing, "config_json": config_json},
    }


@router.get("/quickbooks/authorize-url")
async def quickbooks_authorize_url():
    client_id = os.getenv("QUICKBOOKS_CLIENT_ID", "").strip()
    if not client_id:
        raise HTTPException(status_code=500, detail="QUICKBOOKS_CLIENT_ID not configured")

    redirect_uri = f"{settings.APP_URL}/integrations/callback/quickbooks"
    scope = os.getenv("QUICKBOOKS_SCOPES", "com.intuit.quickbooks.accounting").strip()
    state = secrets.token_urlsafe(24)
    url = str(
        httpx.URL("https://appcenter.intuit.com/connect/oauth2").copy_merge_params(
            {
                "client_id": client_id,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": scope,
                "state": state,
            }
        )
    )
    return {"url": url, "state": state}


@router.post("/quickbooks/complete")
async def quickbooks_complete(
    payload: dict,
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)

    code = str(payload.get("code") or "").strip()
    realm_id = payload.get("realmId")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    client_id = os.getenv("QUICKBOOKS_CLIENT_ID", "").strip()
    client_secret = os.getenv("QUICKBOOKS_CLIENT_SECRET", "").strip()
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="QuickBooks OAuth not configured")

    redirect_uri = f"{settings.APP_URL}/integrations/callback/quickbooks"
    token_url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
    basic = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            token_url,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={
                "Authorization": f"Basic {basic}",
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"QuickBooks token exchange failed: {resp.text}")

    token_data = resp.json()
    config_payload = IntegrationConfigPayload(
        platform="quickbooks",
        is_active=True,
        config_json={
            "realm_id": realm_id,
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
            "expires_in": token_data.get("expires_in"),
            "refresh_token_expires_in": token_data.get("x_refresh_token_expires_in"),
            "token_type": token_data.get("token_type"),
            "account_mapping": {},
        },
    )
    row = _build_integration_row(user_id, config_payload)
    res = await db_upsert("integration_settings", row, on_conflict="user_id,platform", token=bearer)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to save integration")

    await _write_integration_audit_log(
        user_id=user_id,
        platform="quickbooks",
        event_type="oauth_complete",
        status="success",
        bearer=bearer,
        message="QuickBooks OAuth completed.",
        metrics={"realm_id": realm_id},
    )
    return {"success": True}


@router.get("/shopify/authorize-url")
async def shopify_authorize_url(shop: str):
    api_key = os.getenv("SHOPIFY_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="SHOPIFY_API_KEY not configured")

    shop_domain = _clean_shop_domain(shop)
    redirect_uri = f"{settings.APP_URL}/integrations/callback/shopify"
    scope = os.getenv("SHOPIFY_SCOPES", "read_products,read_orders").strip()
    state = secrets.token_urlsafe(24)
    url = str(
        httpx.URL(f"https://{shop_domain}/admin/oauth/authorize").copy_merge_params(
            {
                "client_id": api_key,
                "scope": scope,
                "redirect_uri": redirect_uri,
                "state": state,
            }
        )
    )
    return {"url": url, "state": state}


@router.post("/shopify/complete")
async def shopify_complete(
    payload: dict,
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)

    query = str(payload.get("query") or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")

    params = dict(parse_qsl(query, keep_blank_values=True))
    hmac_received = params.pop("hmac", "")
    params.pop("signature", None)

    shop = (params.get("shop") or "").strip()
    code = (params.get("code") or "").strip()
    if not shop or not code or not hmac_received:
        raise HTTPException(status_code=400, detail="Missing required callback params")

    secret = os.getenv("SHOPIFY_API_SECRET", "").strip()
    api_key = os.getenv("SHOPIFY_API_KEY", "").strip()
    if not secret or not api_key:
        raise HTTPException(status_code=500, detail="Shopify OAuth not configured")

    message = "&".join([f"{k}={params[k]}" for k in sorted(params.keys())])
    digest = hmaclib.new(secret.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmaclib.compare_digest(digest, hmac_received):
        raise HTTPException(status_code=400, detail="Invalid Shopify signature")

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            f"https://{shop}/admin/oauth/access_token",
            json={"client_id": api_key, "client_secret": secret, "code": code},
            headers={"Accept": "application/json"},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Shopify token exchange failed: {resp.text}")

    token_data = resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Missing access_token from Shopify")

    config_payload = IntegrationConfigPayload(
        platform="shopify",
        is_active=True,
        store_url=shop,
        config_json={"shop": shop, "access_token": access_token},
    )
    row = _build_integration_row(user_id, config_payload)
    res = await db_upsert("integration_settings", row, on_conflict="user_id,platform", token=bearer)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to save integration")

    await _write_integration_audit_log(
        user_id=user_id,
        platform="shopify",
        event_type="oauth_complete",
        status="success",
        bearer=bearer,
        message="Shopify OAuth completed.",
        metrics={"shop": shop},
    )
    return {"success": True}


@router.get("/configs")
async def list_integration_configs(
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)
    rows = await db_select(
        "integration_settings",
        filters={"user_id": user_id},
        order_by="updated_at",
        ascending=False,
        token=bearer,
    )
    return rows or []


@router.get("/configs/{platform}")
async def get_integration_config(
    platform: str,
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)
    normalized_platform = _normalize_platform(platform)
    return await _get_integration_or_404(user_id, normalized_platform, bearer)


@router.post("/configs")
async def create_or_upsert_integration_config(
    payload: IntegrationConfigPayload,
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)
    row = _build_integration_row(user_id, payload)

    res = await db_upsert("integration_settings", row, on_conflict="user_id,platform", token=bearer)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to save integration settings")

    await _write_integration_audit_log(
        user_id=user_id,
        platform=payload.platform,
        event_type="config_upsert",
        status="success",
        bearer=bearer,
        message=f"{payload.platform} configuration saved.",
        metrics={"is_active": payload.is_active},
    )
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else {"success": True}


@router.post("/config")
async def upsert_integration_config(
    payload: IntegrationConfigPayload,
    authorization: Optional[str] = Header(default=None),
):
    return await create_or_upsert_integration_config(payload, authorization)


@router.patch("/configs/{platform}")
async def update_integration_config(
    platform: str,
    payload: dict[str, Any],
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)
    normalized_platform = _normalize_platform(platform)
    existing = await _get_integration_or_404(user_id, normalized_platform, bearer)

    patch_data = {
        "platform": normalized_platform,
        "is_active": bool(payload.get("is_active", existing.get("is_active", True))),
        "store_url": payload.get("store_url", existing.get("store_url")),
        "kra_pin": payload.get("kra_pin", existing.get("kra_pin")),
        "branch_code": payload.get("branch_code", existing.get("branch_code")),
        "device_serial": payload.get("device_serial", existing.get("device_serial")),
        "company_name": payload.get("company_name", existing.get("company_name")),
        "access_token": payload.get("access_token"),
        "config_json": {
            **dict(existing.get("config_json") or {}),
            **dict(payload.get("config_json") or {}),
        },
    }
    config_payload = IntegrationConfigPayload(**patch_data)
    row = _build_integration_row(user_id, config_payload)

    res = await db_update(
        "integration_settings",
        row,
        {"user_id": user_id, "platform": normalized_platform},
        token=bearer,
    )
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to update integration settings")

    await _write_integration_audit_log(
        user_id=user_id,
        platform=normalized_platform,
        event_type="config_update",
        status="success",
        bearer=bearer,
        message=f"{normalized_platform} configuration updated.",
        metrics={"is_active": config_payload.is_active},
    )
    rows = await db_select(
        "integration_settings",
        filters={"user_id": user_id, "platform": normalized_platform},
        limit=1,
        token=bearer,
    )
    return rows[0] if rows else {**existing, **row}


@router.delete("/configs/{platform}")
async def delete_integration_config(
    platform: str,
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)
    normalized_platform = _normalize_platform(platform)
    await _get_integration_or_404(user_id, normalized_platform, bearer)

    res = await db_delete("integration_settings", {"user_id": user_id, "platform": normalized_platform}, token=bearer)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to delete integration settings")

    await _write_integration_audit_log(
        user_id=user_id,
        platform=normalized_platform,
        event_type="config_delete",
        status="success",
        bearer=bearer,
        message=f"{normalized_platform} configuration deleted.",
    )
    return {"success": True}


@router.get("/{platform}/audit-logs")
async def get_integration_audit_logs(
    platform: str,
    limit: int = Query(25, ge=1, le=200),
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)
    normalized_platform = _normalize_platform(platform)

    logs = await db_select(
        "integration_audit_logs",
        filters={"user_id": user_id, "platform": normalized_platform},
        order_by="created_at",
        ascending=False,
        limit=limit,
        token=bearer,
    )
    if logs:
        return logs

    rpc_logs = await db_rpc(
        "get_integration_events",
        {"p_platform": normalized_platform, "p_limit": limit},
        token=bearer,
    )
    return rpc_logs or []


@router.post("/{platform}/sync")
async def sync_integration_platform(
    platform: str,
    authorization: Optional[str] = Header(default=None),
):
    bearer = _get_bearer(authorization)
    user_id = await _get_user_id_from_jwt(bearer)
    normalized_platform = _normalize_platform(platform)
    return await _sync_integration_platform(user_id, normalized_platform, bearer)


@router.post("/quickbooks/sync")
async def sync_quickbooks(
    authorization: Optional[str] = Header(default=None),
):
    return await sync_integration_platform("quickbooks", authorization)


@router.post("/shopify/sync")
async def sync_shopify(
    authorization: Optional[str] = Header(default=None),
):
    return await sync_integration_platform("shopify", authorization)


@router.post("/etims/sync")
async def sync_etims(
    authorization: Optional[str] = Header(default=None),
):
    return await sync_integration_platform("etims", authorization)
