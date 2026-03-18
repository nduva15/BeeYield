
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

# --- Enums ---
class UnitSystem(str, Enum):
    METRIC = "metric"
    IMPERIAL = "imperial"

class Theme(str, Enum):
    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"

# --- Profiles Data ---
class ProfileSchema(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = "en-GB"
    unit_system: Optional[UnitSystem] = UnitSystem.METRIC
    theme: Optional[Theme] = Theme.AUTO
    
    class Config:
        from_attributes = True

# --- User Preferences ---
class UserPreferencesSchema(BaseModel):
    user_id: UUID
    email_device_alerts: bool = True
    email_ai_tips: bool = True
    email_marketing: bool = False
    app_tips_enabled: bool = True
    
    class Config:
        from_attributes = True

class UserPreferencesUpdate(BaseModel):
    email_device_alerts: Optional[bool] = None
    email_ai_tips: Optional[bool] = None
    email_marketing: Optional[bool] = None
    app_tips_enabled: Optional[bool] = None

# --- Alert Thresholds ---
class ThresholdSchema(BaseModel):
    temp_high: Optional[float] = None
    temp_low: Optional[float] = None
    weight_drop: Optional[float] = None

class AlertThresholdCreate(ThresholdSchema):
    hive_id: Optional[UUID] = None # If None, it's global

class AlertThresholdResponse(ThresholdSchema):
    id: Optional[UUID] = None # Optional because default/unsaved globals have no ID
    user_id: Optional[UUID] = None
    hive_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Hive View Response ---
class HiveAlertSettingsView(BaseModel):
    hive_id: UUID
    hive_name: Optional[str] = None
    hive_code: Optional[str] = None
    user_id: UUID
    threshold_id: Optional[UUID] = None
    
    # Raw overrides
    override_temp_high: Optional[float] = None
    override_temp_low: Optional[float] = None
    override_weight_drop: Optional[float] = None
    
    # Global defaults at time of fetch
    global_temp_high: Optional[float] = None
    global_temp_low: Optional[float] = None
    global_weight_drop: Optional[float] = None
    
    # Effective values
    effective_temp_high: Optional[float] = None
    effective_temp_low: Optional[float] = None
    effective_weight_drop: Optional[float] = None

# --- Full Settings Response ---
class FullSettingsResponse(BaseModel):
    profile: Optional[ProfileSchema] = None
    preferences: Optional[UserPreferencesSchema] = None
    global_thresholds: Optional[AlertThresholdResponse] = None

# --- PRD: New Settings Schemas ---
class UserNotificationSettingsSchema(BaseModel):
    user_id: UUID
    email_alerts_enabled: bool = True
    sms_alerts_enabled: bool = False
    push_notifications_enabled: bool = True
    notify_on_swarm: bool = True
    notify_on_low_battery: bool = True
    notify_on_theft: bool = True
    
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    email_alerts_enabled: Optional[bool] = None
    sms_alerts_enabled: Optional[bool] = None
    push_notifications_enabled: Optional[bool] = None
    notify_on_swarm: Optional[bool] = None
    notify_on_low_battery: Optional[bool] = None
    notify_on_theft: Optional[bool] = None

class GlobalIoTSettingsSchema(BaseModel):
    user_id: UUID
    temp_min_threshold: float = 15.0
    temp_max_threshold: float = 38.0
    weight_drop_alert_kg: float = 2.0
    humidity_min_threshold: int = 40
    humidity_max_threshold: int = 80
    
    class Config:
        from_attributes = True

class IoTSettingsUpdate(BaseModel):
    temp_min_threshold: Optional[float] = None
    temp_max_threshold: Optional[float] = None
    weight_drop_alert_kg: Optional[float] = None
    humidity_min_threshold: Optional[int] = None
    humidity_max_threshold: Optional[int] = None
