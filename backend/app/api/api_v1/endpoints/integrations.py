import base64
import hmac as hmaclib
import hashlib
import os
import secrets
from typing import Optional
from urllib.parse import parse_qsl

import httpx
from fastapi import APIRouter, Header, HTTPException

from app.core.config import settings
from app.db.supabase_db import db_select, db_upsert

router = APIRouter()


async def _get_user_id_from_jwt(user_jwt: str) -> str:
    """
    Resolve Supabase user id from a Bearer JWT.
    We do this server-side to avoid trusting user_id from the client.
    """
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
    """
    Exchange QuickBooks code for tokens and persist integration_settings for the logged-in user.
    Frontend must call this endpoint after the OAuth redirect.
    """
    bearer = (authorization or "").replace("Bearer", "").strip()
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

    form = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            token_url,
            data=form,
            headers={
                "Authorization": f"Basic {basic}",
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"QuickBooks token exchange failed: {resp.text}")

    token_data = resp.json()
    config_json = {
        "realm_id": realm_id,
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "expires_in": token_data.get("expires_in"),
        "refresh_token_expires_in": token_data.get("x_refresh_token_expires_in"),
        "token_type": token_data.get("token_type"),
        # User-configurable mappings can be saved by frontend using upsertIntegrationConfig
        "account_mapping": {},
    }

    res = await db_upsert(
        "integration_settings",
        {
            "user_id": user_id,
            "platform": "quickbooks",
            "is_active": True,
            "config_json": config_json,
        },
        on_conflict="user_id,platform",
        token=bearer,
    )

    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to save integration")

    return {"success": True}


@router.get("/shopify/authorize-url")
async def shopify_authorize_url(shop: str):
    api_key = os.getenv("SHOPIFY_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="SHOPIFY_API_KEY not configured")

    shop = (shop or "").strip().replace("https://", "").replace("http://", "")
    shop = shop.split("/")[0]
    if not shop or "." not in shop:
        raise HTTPException(status_code=400, detail="Invalid shop domain")

    redirect_uri = f"{settings.APP_URL}/integrations/callback/shopify"
    scope = os.getenv("SHOPIFY_SCOPES", "read_products,read_orders").strip()
    state = secrets.token_urlsafe(24)

    url = str(
        httpx.URL(f"https://{shop}/admin/oauth/authorize").copy_merge_params(
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
    """
    Validate Shopify callback signature (hmac), exchange code for access token,
    and persist integration_settings for the logged-in user.
    """
    bearer = (authorization or "").replace("Bearer", "").strip()
    user_id = await _get_user_id_from_jwt(bearer)

    query = str(payload.get("query") or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")

    # Parse query params; Shopify recommends sorting by key and excluding hmac/signature.
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

    token_url = f"https://{shop}/admin/oauth/access_token"
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            token_url,
            json={"client_id": api_key, "client_secret": secret, "code": code},
            headers={"Accept": "application/json"},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Shopify token exchange failed: {resp.text}")

    token_data = resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Missing access_token from Shopify")

    config_json = {"shop": shop, "access_token": access_token}
    res = await db_upsert(
        "integration_settings",
        {
            "user_id": user_id,
            "platform": "shopify",
            "is_active": True,
            "store_url": shop,
            "config_json": config_json,
        },
        on_conflict="user_id,platform",
        token=bearer,
    )

    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to save integration")

    return {"success": True}


@router.get("/configs")
async def list_integration_configs(
    authorization: Optional[str] = Header(default=None),
):
    """
    Returns integration_settings rows for the authenticated user.
    This is the single source of truth for integrations UI (avoid direct Supabase writes from browser).
    """
    bearer = (authorization or "").replace("Bearer", "").strip()
    user_id = await _get_user_id_from_jwt(bearer)
    rows = await db_select("integration_settings", filters={"user_id": user_id}, order_by="updated_at", ascending=False, token=bearer)
    return rows or []


@router.post("/config")
async def upsert_integration_config(
    payload: dict,
    authorization: Optional[str] = Header(default=None),
):
    """
    Upsert an integration_settings record for the authenticated user.
    Supports toggling active state and saving per-platform settings (store_url, config_json, etc).
    """
    bearer = (authorization or "").replace("Bearer", "").strip()
    user_id = await _get_user_id_from_jwt(bearer)

    platform = str(payload.get("platform") or "").strip().lower()
    if platform not in {"quickbooks", "shopify", "etims"}:
        raise HTTPException(status_code=400, detail="Invalid platform")

    is_active = bool(payload.get("is_active", True))
    store_url = payload.get("store_url")
    kra_pin = payload.get("kra_pin")
    branch_code = payload.get("branch_code")
    device_serial = payload.get("device_serial")
    access_token = payload.get("access_token")
    config_json = payload.get("config_json")

    # Only allow specific columns to be set from client.
    data = {
        "user_id": user_id,
        "platform": platform,
        "is_active": is_active,
    }
    if store_url is not None:
        data["store_url"] = store_url
    if kra_pin is not None:
        data["kra_pin"] = kra_pin
    if branch_code is not None:
        data["branch_code"] = branch_code
    if device_serial is not None:
        data["device_serial"] = device_serial
    if access_token is not None:
        data["access_token"] = access_token
    if config_json is not None:
        data["config_json"] = config_json

    res = await db_upsert(
        "integration_settings",
        data,
        on_conflict="user_id,platform",
        token=bearer,
    )
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error") or "Failed to save integration settings")
    # Return the single row if available
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else {"success": True}

