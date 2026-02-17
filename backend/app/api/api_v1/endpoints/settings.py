
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from typing import Any, List, Optional
from uuid import UUID
from app.db.supabase_db import db_select, db_upsert, db_update, db_insert, get_client
from app.core import security
from app.schemas.user_settings import (
    FullSettingsResponse, 
    ProfileSchema, 
    UserPreferencesSchema, 
    ThresholdSchema,
    AlertThresholdCreate,
    UserPreferencesUpdate,
    NotificationUpdate,
    UserNotificationSettingsSchema,
    IoTSettingsUpdate,
    GlobalIoTSettingsSchema,
    HiveAlertSettingsView
)

router = APIRouter()

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    """Extract user ID from JWT token"""
    if isinstance(current_user, dict):
        user_id = current_user.get("sub") or current_user.get("id")
    else:
        # Fallback if it's an object
        user_id = getattr(current_user, "id", None)
        
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return str(user_id)

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# 1. Get All Settings (Load Page)
@router.get("/full", response_model=FullSettingsResponse)
async def get_full_settings(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Get Profile, Preferences, and Global Thresholds.
    """
    # A. Profile
    # Try fetching from 'profiles'
    profiles = await db_select("profiles", filters={"id": user_id}, token=token)
    if not profiles:
        # Create profile if it doesn't exist
        profile_data = {"id": user_id, "updated_at": "now()"}
        await db_insert("profiles", profile_data, token=token)
    else:
        profile_data = profiles[0]
    
    # B. Preferences
    prefs = await db_select("user_preferences", filters={"user_id": user_id}, token=token)
    if not prefs:
        # Create default
        default_prefs = {
            "user_id": user_id,
            "email_device_alerts": True,
            "email_ai_tips": True,
            "email_marketing": False,
            "app_tips_enabled": True
        }
        await db_upsert("user_preferences", default_prefs, token=token)
        pref_data = default_prefs
    else:
        pref_data = prefs[0]
        
    # C. Global Thresholds
    thresholds = await db_select("alert_thresholds", filters={"user_id": user_id, "hive_id": "is.null"}, token=token)
    if not thresholds:
        global_data = {
            "temp_high": 38.0, 
            "temp_low": 15.0, 
            "weight_drop": 1.0
        }
    else:
        global_data = thresholds[0]
        
    return {
        "profile": profile_data,
        "preferences": pref_data,
        "global_thresholds": global_data
    }

# 2. Get Hive Threshold List (The Table View)
@router.get("/hives", response_model=List[HiveAlertSettingsView])
async def get_hive_settings(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Get list of hives with their effective thresholds (merged global + specific).
    """
    hives = await db_select("hives", columns="id,apiary_id,hive_code,user_id", filters={"user_id": user_id}, limit=1000, token=token)
    apiaries = await db_select("apiaries", columns="id,name", filters={"user_id": user_id}, limit=1000, token=token)
    apiary_map = {a["id"]: a["name"] for a in apiaries}
    
    thresholds = await db_select("alert_thresholds", filters={"user_id": user_id}, limit=1000, token=token)
    
    global_t = next((t for t in thresholds if t.get("hive_id") is None), {})
    specific_t_map = {t["hive_id"]: t for t in thresholds if t.get("hive_id")}
    
    results = []
    for h in hives:
        h_id = h.get("id")
        a_id = h.get("apiary_id")
        spec = specific_t_map.get(h_id, {})
        
        eff_temp_high = spec.get("temp_high") if spec.get("temp_high") is not None else global_t.get("temp_high", 38.0)
        eff_temp_low = spec.get("temp_low") if spec.get("temp_low") is not None else global_t.get("temp_low", 15.0)
        eff_weight_drop = spec.get("weight_drop") if spec.get("weight_drop") is not None else global_t.get("weight_drop", 1.0)
        
        results.append({
            "hive_id": h_id,
            "hive_name": apiary_map.get(a_id, "Main Apiary"),
            "hive_code": h.get("hive_code"),
            "user_id": user_id,
            "threshold_id": spec.get("id"),
            "override_temp_high": spec.get("temp_high"),
            "override_temp_low": spec.get("temp_low"),
            "override_weight_drop": spec.get("weight_drop"),
            "global_temp_high": global_t.get("temp_high"),
            "global_temp_low": global_t.get("temp_low"),
            "global_weight_drop": global_t.get("weight_drop"),
            "effective_temp_high": eff_temp_high,
            "effective_temp_low": eff_temp_low,
            "effective_weight_drop": eff_weight_drop
        })
        
    return results

# 3. Update Specific Hive Threshold
@router.post("/hives/{hive_id}/thresholds", response_model=dict)
async def update_hive_threshold(
    hive_id: str, 
    data: ThresholdSchema, 
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Upsert threshold for a specific hive.
    """
    target_hive_id = None if hive_id == "global" else hive_id
    
    filters = {"user_id": user_id}
    if target_hive_id:
        filters["hive_id"] = target_hive_id
    else:
        filters["hive_id"] = "is.null"
        
    existing = await db_select("alert_thresholds", filters=filters, token=token)
    
    payload = data.dict(exclude_unset=True)
    payload["user_id"] = user_id
    if target_hive_id:
        payload["hive_id"] = target_hive_id
    else:
        payload["hive_id"] = None
        
    if existing:
        update_filters = {"id": existing[0]["id"]}
        res = await db_update("alert_thresholds", payload, update_filters, token=token)
    else:
        res = await db_insert("alert_thresholds", payload, token=token)
        
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to update threshold: {res.get('error')}")
        
    return {"message": "Threshold updated", "data": res.get("data")}

# 4. Update Profile
@router.put("/profile", response_model=dict)
async def update_profile(
    data: dict = Body(...),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update user profile (phone, names, settings)"""
    allowed = ["first_name", "last_name", "phone", "language", "unit_system", "theme", "avatar_url"]
    clean_data = {k: v for k, v in data.items() if k in allowed}
    
    if not clean_data:
        raise HTTPException(status_code=400, detail="No valid fields provided")
        
    res = await db_update("profiles", clean_data, {"id": user_id}, token=token)
    if not res.get("success"):
         raise HTTPException(status_code=500, detail="Failed to update profile")
         
    return {"message": "Profile updated", "data": res.get("data")}

# 5. Update Preferences
@router.put("/preferences", response_model=dict)
async def update_preferences(
    data: UserPreferencesUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Update user notification preferences"""
    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data")
        
    existing = await db_select("user_preferences", filters={"user_id": user_id}, token=token)
    if existing:
        res = await db_update("user_preferences", payload, {"user_id": user_id}, token=token)
    else:
        payload["user_id"] = user_id
        res = await db_insert("user_preferences", payload, token=token)
        
    if not res.get("success"):
        raise HTTPException(status_code=500, detail="Failed to update preferences")
        
    return {"message": "Preferences updated", "data": res.get("data")}

# --- PRD: New Settings Endpoints ---

@router.patch("/notifications", response_model=dict)
async def update_notifications(
    data: NotificationUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Partial update for user notification settings (PRD)"""
    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")
        
    res = await db_update("user_notification_settings", payload, {"user_id": user_id}, token=token)
    if not res.get("success"):
        payload["user_id"] = user_id
        res = await db_upsert("user_notification_settings", payload, token=token)
        
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to update notification settings: {res.get('error')}")
        
    return {"status": "updated", "data": res.get("data")}

@router.patch("/iot", response_model=dict)
async def update_iot_thresholds(
    data: IoTSettingsUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Partial update for global IoT settings (PRD)"""
    payload = data.dict(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")
        
    res = await db_update("global_iot_settings", payload, {"user_id": user_id}, token=token)
    if not res.get("success"):
        payload["user_id"] = user_id
        res = await db_upsert("global_iot_settings", payload, token=token)
        
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to update IoT thresholds: {res.get('error')}")
        
    return {"status": "thresholds_updated", "data": res.get("data")}

@router.get("/notifications", response_model=UserNotificationSettingsSchema)
async def get_notifications(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get user notification settings"""
    settings = await db_select("user_notification_settings", filters={"user_id": user_id}, token=token)
    if not settings:
        return {
            "user_id": user_id,
            "email_alerts_enabled": True,
            "sms_alerts_enabled": False,
            "push_notifications_enabled": True,
            "notify_on_swarm": True,
            "notify_on_low_battery": True,
            "notify_on_theft": True
        }
    return settings[0]

@router.get("/iot", response_model=GlobalIoTSettingsSchema)
async def get_iot_settings(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get global IoT settings"""
    settings = await db_select("global_iot_settings", filters={"user_id": user_id}, token=token)
    if not settings:
        return {
            "user_id": user_id,
            "temp_min_threshold": 15.0,
            "temp_max_threshold": 38.0,
            "weight_drop_alert_kg": 2.0,
            "humidity_min_threshold": 40,
            "humidity_max_threshold": 80
        }
    return settings[0]

