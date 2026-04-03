from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ForageZoneBase(BaseModel):
    apiary_id: Optional[str] = None
    zone_name: Optional[str] = None
    flora_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = None
    density_score: Optional[float] = None
    season: Optional[str] = None
    geojson: Optional[dict[str, Any]] = None
    notes: Optional[str] = None


class ForageZoneCreate(ForageZoneBase):
    apiary_id: str


class ForageZoneUpdate(ForageZoneBase):
    pass


class ForageZone(ForageZoneBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
