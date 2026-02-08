from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class UserSettingsBase(BaseModel):
    language: Optional[str] = "en"
    unit_system: Optional[str] = "Metric"
    theme: Optional[str] = "System"
    timezone: Optional[str] = "UTC"
    temp_threshold_high: Optional[float] = 38.0
    temp_threshold_low: Optional[float] = 32.0
    weight_drop_threshold: Optional[float] = 2.0

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettings(UserSettingsBase):
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NotificationConfigBase(BaseModel):
    event_type: str
    email_enabled: bool = True
    push_enabled: bool = True
    sms_enabled: bool = False

class NotificationConfigUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None

class NotificationConfig(NotificationConfigBase):
    user_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True

class UserSettingsResponse(UserSettingsBase):
    notification_configs: List[NotificationConfig] = []

class HiveThresholdsUpdate(BaseModel):
    temp_threshold_high: Optional[float] = None
    temp_threshold_low: Optional[float] = None
    weight_drop_threshold: Optional[float] = None
