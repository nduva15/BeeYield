from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Any
from app.services.meter_service import MeterService
from app.schemas import meter as schemas

router = APIRouter()

@router.get("/buildings", response_model=List[schemas.Building])
def list_buildings():
    """List all buildings with meters."""
    return MeterService.get_buildings()

@router.get("/apartments", response_model=List[schemas.Apartment])
def list_apartments(building_id: Optional[str] = None):
    """List apartments, optionally filtered by building."""
    return MeterService.get_apartments(building_id)

@router.get("/devices", response_model=List[schemas.Meter])
def list_meters(
    building_id: Optional[str] = None,
    apartment_id: Optional[str] = None,
    meter_type: Optional[str] = None
):
    """List meter devices with optional filters."""
    return MeterService.get_meters(building_id, apartment_id, meter_type)

@router.get("/readings/{meter_id}", response_model=List[schemas.Reading])
def get_meter_readings(meter_id: str, limit: int = 50):
    """Get historical readings for a specific meter."""
    return MeterService.get_readings(meter_id, limit)

@router.get("/billing-rates", response_model=List[schemas.BillingRate])
def get_billing_rates():
    """Get active billing rates for all utility types."""
    return MeterService.get_billing_rates()

@router.get("/events", response_model=List[schemas.MeterEvent])
def get_meter_events(severity: Optional[str] = None, limit: int = 50):
    """Get recent meter events and alarms."""
    return MeterService.get_events(severity, limit)
