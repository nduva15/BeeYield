from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class ForageZoneBase(BaseModel):
    apiary_id: UUID
    zone_name: Optional[str] = None
    flora_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = None
    density_score: Optional[float] = None
    season: Optional[str] = None
    geojson: Optional[Any] = None
    notes: Optional[str] = None


class ForageZoneCreate(ForageZoneBase):
    pass


class ForageZoneUpdate(BaseModel):
    zone_name: Optional[str] = None
    flora_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = None
    density_score: Optional[float] = None
    season: Optional[str] = None
    geojson: Optional[Any] = None
    notes: Optional[str] = None


class ForageZone(ForageZoneBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
