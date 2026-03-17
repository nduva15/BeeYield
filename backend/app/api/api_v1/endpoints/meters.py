from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Any
from app.services.meter_service import MeterService
from app.schemas import meter as schemas

router = APIRouter()

@router.get("/buildings", response_model=List[schemas.Building])
async def list_buildings():
    """List all buildings with meters."""
    return await MeterService.get_buildings()

@router.get("/apartments", response_model=List[schemas.Apartment])
async def list_apartments(building_id: Optional[str] = None):
    """List apartments, optionally filtered by building."""
    return await MeterService.get_apartments(building_id)

@router.get("/devices", response_model=List[schemas.Meter])
async def list_meters(
    building_id: Optional[str] = None,
    apartment_id: Optional[str] = None,
    meter_type: Optional[str] = None
):
    """List meter devices with optional filters."""
    return await MeterService.get_meters(building_id, apartment_id, meter_type)


@router.post("/devices", response_model=schemas.Meter)
async def create_meter(body: schemas.MeterCreate):
    """Create/enroll a new meter device."""
    try:
        return await MeterService.create_meter(body.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/readings/{meter_id}", response_model=List[schemas.Reading])
async def get_meter_readings(meter_id: str, limit: int = 50):
    """Get historical readings for a specific meter."""
    return await MeterService.get_readings(meter_id, limit)

@router.get("/billing-rates", response_model=List[schemas.BillingRate])
async def get_billing_rates():
    """Get active billing rates for all utility types."""
    return await MeterService.get_billing_rates()


@router.post("/billing-rates", response_model=schemas.BillingRate)
async def create_billing_rate(body: schemas.BillingRateCreate):
    """Create a new billing rate."""
    try:
        return await MeterService.create_billing_rate(body.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/events", response_model=List[schemas.MeterEvent])
async def get_meter_events(severity: Optional[str] = None, limit: int = 50):
    """Get recent meter events and alarms."""
    return await MeterService.get_events(severity, limit)
