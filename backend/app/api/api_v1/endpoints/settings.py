from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List
from app.db.supabase_db import db_select, db_upsert, db_update, db_insert
from app.core import security
from app.schemas.user_settings import (
    UserSettings, UserSettingsUpdate, UserSettingsResponse,
    NotificationConfig, NotificationConfigUpdate, HiveThresholdsUpdate
)
from uuid import UUID

router = APIRouter()

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    """Extract user ID from JWT token"""
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id

@router.get("", response_model=UserSettingsResponse)
def get_settings(user_id: str = Depends(get_user_id)):
    """Fetch user settings and notification configs"""
    # 1. Fetch main settings
    settings_records = db_select("user_settings", filters={"user_id": user_id})
    
    if not settings_records:
        # Auto-create default settings if they don't exist
        default_settings = {
            "user_id": user_id,
            "language": "en",
            "unit_system": "Metric",
            "theme": "System",
            "timezone": "UTC",
            "temp_threshold_high": 38.0,
            "temp_threshold_low": 32.0,
            "weight_drop_threshold": 2.0
        }
        upsert_res = db_upsert("user_settings", default_settings, on_conflict="user_id")
        if not upsert_res.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create default settings")
        settings = default_settings
    else:
        settings = settings_records[0]
    
    # 2. Fetch notification configs
    notif_configs = db_select("notification_configs", filters={"user_id": user_id})
    
    # If no notification configs, create defaults for common events
    if not notif_configs:
        default_events = ["swarm_alert", "low_battery", "weight_loss", "temp_surge"]
        for event in default_events:
            notif_data = {
                "user_id": user_id,
                "event_type": event,
                "email_enabled": True,
                "push_enabled": True,
                "sms_enabled": False
            }
            db_upsert("notification_configs", notif_data, on_conflict="user_id,event_type")
        
        notif_configs = db_select("notification_configs", filters={"user_id": user_id})
    
    # Combine
    return {**settings, "notification_configs": notif_configs}

@router.put("", response_model=dict)
def update_settings(
    settings_in: UserSettingsUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update user settings"""
    data = settings_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")
    
    result = db_update("user_settings", data, {"user_id": user_id})
    
    if not result.get("success"):
        # If update fails because record doesn't exist, try upsert
        data["user_id"] = user_id
        result = db_upsert("user_settings", data, on_conflict="user_id")
        
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update settings"))
    
    return {"message": "Settings updated successfully", "data": result.get("data")}

@router.put("/notifications/{event_type}", response_model=dict)
def update_notification_config(
    event_type: str,
    config_in: NotificationConfigUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update a specific notification configuration"""
    data = config_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")
    
    # Check if exists
    existing = db_select("notification_configs", filters={"user_id": user_id, "event_type": event_type})
    
    if existing:
        result = db_update("notification_configs", data, {"user_id": user_id, "event_type": event_type})
    else:
        # Create new
        data["user_id"] = user_id
        data["event_type"] = event_type
        result = db_insert("notification_configs", data)
        
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update notification config"))
    
    return {"message": f"Notification config for {event_type} updated", "data": result.get("data")}

@router.put("/hives/{hive_id}", response_model=dict)
def update_hive_thresholds(
    hive_id: str,
    thresholds_in: HiveThresholdsUpdate,
    user_id: str = Depends(get_user_id)
):
    """Update thresholds for a specific hive"""
    # 1. Verify ownership/access
    # We should use check_apiary_access or similar, but for now we check beekeeper_id in hives table
    hive = db_select("hives", filters={"id": hive_id})
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    if str(hive[0].get("beekeeper_id")) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this hive")
    
    # 2. Update
    data = thresholds_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")
        
    result = db_update("hives", data, {"id": hive_id})
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to update hive thresholds"))
        
    return {"message": "Hive thresholds updated successfully", "data": result.get("data")}
