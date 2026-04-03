from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class BuildingBase(BaseModel):
    name: str
    address: str
    county: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    metadata: Optional[dict] = {}

class BuildingCreate(BuildingBase):
    pass

class Building(BuildingBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ApartmentBase(BaseModel):
    building_id: str
    unit_number: str
    floor: Optional[str] = None
    occupant_name: Optional[str] = None
    metadata: Optional[dict] = {}

class ApartmentCreate(ApartmentBase):
    pass

class Apartment(ApartmentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class MeterBase(BaseModel):
    apartment_id: Optional[str] = None
    building_id: str
    meter_type: str # 'Water', 'Heat', 'Energy', 'Other'
    meter_number: str
    meter_code: Optional[str] = None
    status: Optional[str] = 'OK'
    has_alarm: Optional[bool] = False
    install_date: Optional[date] = None
    last_reading_value: Optional[float] = None
    last_reading_unit: Optional[str] = None

class MeterCreate(MeterBase):
    pass

class MeterUpdate(BaseModel):
    apartment_id: Optional[str] = None
    building_id: Optional[str] = None
    meter_type: Optional[str] = None
    meter_number: Optional[str] = None
    meter_code: Optional[str] = None
    status: Optional[str] = None
    has_alarm: Optional[bool] = None
    install_date: Optional[date] = None
    last_reading_value: Optional[float] = None
    last_reading_unit: Optional[str] = None

class Meter(MeterBase):
    id: str
    last_reading_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReadingBase(BaseModel):
    meter_id: str
    value: float
    unit: str
    timestamp: Optional[datetime] = None
    reading_type: Optional[str] = 'AUTOMATIC'

class ReadingCreate(ReadingBase):
    pass

class Reading(ReadingBase):
    id: str

    class Config:
        from_attributes = True

class BillingRateBase(BaseModel):
    meter_type: str
    rate_per_unit: float
    unit: str
    currency: Optional[str] = 'KES'
    description: Optional[str] = None
    is_active: Optional[bool] = True

class BillingRateCreate(BillingRateBase):
    pass

class BillingRateUpdate(BaseModel):
    meter_type: Optional[str] = None
    rate_per_unit: Optional[float] = None
    unit: Optional[str] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class BillingRate(BillingRateBase):
    id: str
    effective_from: datetime

    class Config:
        from_attributes = True

class MeterEventBase(BaseModel):
    meter_id: str
    event_type: str
    severity: str
    message: Optional[str] = None
    reason: Optional[str] = None

class MeterEvent(MeterEventBase):
    id: str
    timestamp: datetime
    is_resolved: bool
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
