from fastapi import APIRouter, HTTPException
from typing import List, Optional
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

@router.get("/devices/{meter_id}", response_model=schemas.Meter)
async def get_meter(meter_id: str):
    """Get a single meter device by ID."""
    meter = await MeterService.get_meter(meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    return meter

@router.post("/devices", response_model=schemas.Meter)
async def create_meter(body: schemas.MeterCreate):
    """Create/enroll a new meter device."""
    try:
        return await MeterService.create_meter(body.model_dump(mode="json", exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/devices/{meter_id}", response_model=schemas.Meter)
async def update_meter(meter_id: str, body: schemas.MeterUpdate):
    """Update a meter device."""
    try:
        updated = await MeterService.update_meter(meter_id, body.model_dump(mode="json", exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Meter not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/devices/{meter_id}", status_code=204)
async def delete_meter(meter_id: str):
    """Delete a meter device."""
    ok = await MeterService.delete_meter(meter_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Meter not found or deletion failed")
    return None

@router.post("/readings", response_model=schemas.Reading)
async def create_meter_reading(body: schemas.ReadingCreate):
    """Create a meter reading and refresh the device snapshot."""
    try:
        return await MeterService.create_reading(body.model_dump(mode="json", exclude_none=True))
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

@router.get("/billing-rates/{rate_id}", response_model=schemas.BillingRate)
async def get_billing_rate(rate_id: str):
    """Get a single billing rate by ID."""
    rate = await MeterService.get_billing_rate(rate_id)
    if not rate:
        raise HTTPException(status_code=404, detail="Billing rate not found")
    return rate

@router.post("/billing-rates", response_model=schemas.BillingRate)
async def create_billing_rate(body: schemas.BillingRateCreate):
    """Create a new billing rate."""
    try:
        return await MeterService.create_billing_rate(body.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/billing-rates/{rate_id}", response_model=schemas.BillingRate)
async def update_billing_rate(rate_id: str, body: schemas.BillingRateUpdate):
    """Update an existing billing rate."""
    try:
        updated = await MeterService.update_billing_rate(rate_id, body.model_dump(exclude_unset=True))
        if not updated:
            raise HTTPException(status_code=404, detail="Billing rate not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/billing-rates/{rate_id}", status_code=204)
async def delete_billing_rate(rate_id: str):
    """Delete a billing rate."""
    ok = await MeterService.delete_billing_rate(rate_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Billing rate not found or deletion failed")
    return None

@router.get("/events", response_model=List[schemas.MeterEvent])
async def get_meter_events(severity: Optional[str] = None, limit: int = 50):
    """Get recent meter events and alarms."""
    return await MeterService.get_events(severity, limit)
