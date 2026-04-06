from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
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


class WeatherMetricSource(BaseModel):
    source: str
    device_id: Optional[str] = None
    provider: Optional[str] = None
    observed_at: Optional[str] = None


class WeatherCurrent(BaseModel):
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    pressure_hpa: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    wind_direction: Optional[str] = None
    feels_like_c: Optional[float] = None
    condition: Optional[str] = None
    cloud_cover_pct: Optional[float] = None
    sunrise_at: Optional[str] = None
    sunset_at: Optional[str] = None
    uv_index: Optional[float] = None
    aqi: Optional[int] = None
    last_observed_at: Optional[str] = None


class WeatherHourlyPoint(BaseModel):
    timestamp: Optional[str] = None
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    pressure_hpa: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    condition: Optional[str] = None
    uv_index: Optional[float] = None


class WeatherDailySummary(BaseModel):
    date: Optional[str] = None
    condition: Optional[str] = None
    temp_max_c: Optional[float] = None
    temp_min_c: Optional[float] = None
    sunrise_at: Optional[str] = None
    sunset_at: Optional[str] = None
    uv_index_max: Optional[float] = None
    aqi: Optional[int] = None


class WeatherLinkedDeviceMeta(BaseModel):
    device_id: str
    device_name: str
    device_type: Optional[str] = None
    status: Optional[str] = None
    last_ping: Optional[str] = None
    last_observed_at: Optional[str] = None


class WeatherSummary(BaseModel):
    apiary_id: str
    current: WeatherCurrent
    hourly_forecast: List[WeatherHourlyPoint] = Field(default_factory=list)
    daily_summary: WeatherDailySummary = Field(default_factory=WeatherDailySummary)
    source_meta: Dict[str, WeatherMetricSource] = Field(default_factory=dict)
    linked_device_meta: List[WeatherLinkedDeviceMeta] = Field(default_factory=list)
