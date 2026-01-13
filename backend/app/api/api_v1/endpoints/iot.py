from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from app.core import security
from app.schemas import iot as schemas
from app.services import iot_service

router = APIRouter()

@router.get("/devices", response_model=List[schemas.IoTDevice])
def get_devices(
    farmer_id: Optional[str] = None,
    current_user: Dict = Depends(security.get_current_user)
):
    """Get all IoT devices. Requires authentication."""
    return iot_service.get_devices(farmer_id)

@router.get("/readings", response_model=List[schemas.SensorReading])
def get_readings(
    device_id: Optional[str] = None,
    sensor_type: Optional[str] = None,
    hours: int = 24,
    current_user: Dict = Depends(security.get_current_user)
):
    """Get sensor readings. Requires authentication."""
    return iot_service.get_sensor_readings(device_id, sensor_type, hours)

@router.get("/client-hives", response_model=List[schemas.ClientHive])
def get_client_hives(
    current_user: Dict = Depends(security.get_current_user)
):
    """Get client hives for the logged-in user."""
    user_id = current_user.get("sub")
    return iot_service.get_client_hives(user_id)

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: Dict = Depends(security.get_current_user)
):
    """Get dashboard stats for the logged-in user."""
    user_id = current_user.get("sub")
    return iot_service.get_dashboard_stats(user_id)
