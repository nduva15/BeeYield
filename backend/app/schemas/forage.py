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


class WeatherMetricSource(BaseModel):
    source: str
    provider: Optional[str] = None
    device_id: Optional[str] = None
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
    time: str
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    pressure_hpa: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    condition: Optional[str] = None
    uv_index: Optional[float] = None


class WeatherDailySummary(BaseModel):
    date: str
    min_temperature_c: Optional[float] = None
    max_temperature_c: Optional[float] = None
    sunrise_at: Optional[str] = None
    sunset_at: Optional[str] = None
    uv_index_max: Optional[float] = None
    max_aqi: Optional[int] = None
    condition: Optional[str] = None


class WeatherLinkedDeviceMeta(BaseModel):
    device_id: str
    device_name: Optional[str] = None
    device_code: Optional[str] = None
    device_type: Optional[str] = None
    last_ping: Optional[str] = None
    last_reading_at: Optional[str] = None


class WeatherSummary(BaseModel):
    apiary_id: str
    apiary_name: Optional[str] = None
    current: WeatherCurrent
    hourly_forecast: list[WeatherHourlyPoint]
    daily_summary: list[WeatherDailySummary]
    source_meta: dict[str, WeatherMetricSource]
    linked_device_meta: list[WeatherLinkedDeviceMeta]
