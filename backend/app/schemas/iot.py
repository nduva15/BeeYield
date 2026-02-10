from pydantic import BaseModel
from typing import Optional, Union, Any, Dict
from datetime import datetime

class IoTDeviceBase(BaseModel):
    device_code: str
    device_name: str
    device_type: str # infield, inland, disease
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    farmer_id: Optional[str] = None
    apiary_id: Optional[str] = None
    hive_id: Optional[str] = None
    status: str = "active"
    battery_level: Optional[int] = None
    firmware_version: Optional[str] = None

class IoTDeviceCreate(IoTDeviceBase):
    pass

class IoTDevice(IoTDeviceBase):
    id: str
    created_at: datetime
    last_ping: Optional[datetime] = None

class SensorReadingBase(BaseModel):
    device_id: str
    sensor_type: str # infield, inland, disease
    timestamp: datetime
    readings: dict[str, Any]
    battery_level: Optional[int] = None
    signal_strength: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "active"

class SensorReading(SensorReadingBase):
    id: str
    created_at: datetime

class ClientHiveBase(BaseModel):
    hive_name: str
    hive_code: Optional[str] = None
    crop_type: Optional[str] = None
    farm_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contract_start: Optional[datetime] = None
    contract_end: Optional[datetime] = None
    status: str = "pending"

class ClientHive(ClientHiveBase):
    id: str
    user_id: str
    created_at: datetime

class DashboardStats(BaseModel):
    totalDevices: int
    activeDevices: int
    totalReadings: int
    lastUpdate: datetime
    avgTemperature: float
    avgHumidity: float
    avgHiveWeight: float
    healthScore: float
