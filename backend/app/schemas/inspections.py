from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import date, datetime
from uuid import UUID

class InspectionBase(BaseModel):
    hive_id: Optional[Union[UUID, str]] = None
    apiary_id: Optional[Union[UUID, str]] = None
    inspector_name: Optional[str] = None
    inspection_date: Optional[Union[date, str]] = None
    inspected_on: Optional[Union[date, str]] = None
    location: Optional[str] = None
    hive_label: Optional[str] = None
    batch: Optional[str] = None
    batch_code: Optional[str] = None
    findings: Optional[str] = None
    actions_taken: Optional[str] = None
    
    # Health & Status
    colony_health: Optional[str] = Field("Healthy", description="Healthy, Watch, At risk, Critical")
    health_status: Optional[str] = None
    temperament: Optional[str] = Field("Calm", description="Calm, Nervous, Defensive, Aggressive")
    
    # Frames & Stores
    total_frames: Optional[int] = 10
    brood_frames: Optional[int] = 6
    honey_frames: Optional[int] = 4
    honey_stores: Optional[float] = None
    pollen_stores: Optional[float] = None
    
    # Queen & Brood
    queen_seen: bool = False
    queen_cells: int = 0
    queen_cells_seen: bool = False
    brood_pattern: Optional[str] = None
    eggs_seen: bool = False
    
    # Pests & Issues
    varroa_count: int = 0
    varroa_mite_count: int = 0
    small_hive_beetles_seen: int = 0
    issues: Optional[List[str]] = Field(default_factory=list)
    actions: Optional[List[str]] = Field(default_factory=list)
    
    # Environment & Notes
    weather: Optional[str] = None
    weather_condition: Optional[str] = None
    temperature_celsius: Optional[float] = None
    notes: Optional[str] = None
    ai_insights: Optional[str] = None
    user_id: Optional[str] = None
    device_id: Optional[str] = None


class InspectionCreate(InspectionBase):
    pass


class InspectionUpdate(BaseModel):
    hive_id: Optional[Union[UUID, str]] = None
    apiary_id: Optional[Union[UUID, str]] = None
    inspector_name: Optional[str] = None
    inspection_date: Optional[Union[date, str]] = None
    inspected_on: Optional[Union[date, str]] = None
    location: Optional[str] = None
    hive_label: Optional[str] = None
    batch: Optional[str] = None
    batch_code: Optional[str] = None
    findings: Optional[str] = None
    actions_taken: Optional[str] = None
    colony_health: Optional[str] = None
    health_status: Optional[str] = None
    temperament: Optional[str] = None
    total_frames: Optional[int] = None
    brood_frames: Optional[int] = None
    honey_frames: Optional[int] = None
    honey_stores: Optional[float] = None
    pollen_stores: Optional[float] = None
    queen_seen: Optional[bool] = None
    queen_cells: Optional[int] = None
    queen_cells_seen: Optional[bool] = None
    brood_pattern: Optional[str] = None
    eggs_seen: Optional[bool] = None
    varroa_count: Optional[int] = None
    varroa_mite_count: Optional[int] = None
    small_hive_beetles_seen: Optional[int] = None
    issues: Optional[List[str]] = None
    actions: Optional[List[str]] = None
    weather: Optional[str] = None
    weather_condition: Optional[str] = None
    temperature_celsius: Optional[float] = None
    notes: Optional[str] = None
    ai_insights: Optional[str] = None


class Inspection(InspectionBase):
    id: Optional[Union[UUID, str]] = None
    created_at: Optional[Union[datetime, str]] = None
    updated_at: Optional[Union[datetime, str]] = None

    class Config:
        from_attributes = True
