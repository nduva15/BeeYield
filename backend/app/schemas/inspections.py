from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from uuid import UUID

# Base Schema
class InspectionBase(BaseModel):
    hive_id: UUID
    inspector_name: Optional[str] = None
    inspection_date: date
    findings: Optional[str] = None
    actions_taken: Optional[str] = None
    
    # Health & Status
    health_status: Optional[str] = None # 'healthy', 'weak', 'diseased', 'critical'
    temperament: Optional[str] = None # 'calm', 'aggressive', 'nervous'
    
    # Stores
    honey_stores: Optional[float] = None
    pollen_stores: Optional[float] = None
    
    # Brood
    brood_pattern: Optional[str] = None # 'solid', 'spotty', 'none'
    eggs_seen: bool = False
    queen_seen: bool = False
    queen_cells_seen: bool = False
    
    # Varroa/Pests
    varroa_mite_count: int = 0
    small_hive_beetles_seen: int = 0
    
    # General
    weather_condition: Optional[str] = None
    temperature_celsius: Optional[float] = None
    
    # Meta
    notes: Optional[str] = None

# Create Schema
class InspectionCreate(InspectionBase):
    pass

# Update Schema
class InspectionUpdate(BaseModel):
    inspector_name: Optional[str] = None
    inspection_date: Optional[date] = None
    findings: Optional[str] = None
    actions_taken: Optional[str] = None
    health_status: Optional[str] = None
    temperament: Optional[str] = None
    honey_stores: Optional[float] = None
    pollen_stores: Optional[float] = None
    brood_pattern: Optional[str] = None
    eggs_seen: Optional[bool] = None
    queen_seen: Optional[bool] = None
    queen_cells_seen: Optional[bool] = None
    varroa_mite_count: Optional[int] = None
    small_hive_beetles_seen: Optional[int] = None
    weather_condition: Optional[str] = None
    temperature_celsius: Optional[float] = None
    notes: Optional[str] = None

# Return Schema
class Inspection(InspectionBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
