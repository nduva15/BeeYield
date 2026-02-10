from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Any
from app.core import security
from app.schemas import iot as schemas
from app.services import iot_service

router = APIRouter()

@router.get("/devices", response_model=list[schemas.IoTDevice])
def get_devices(
    farmer_id: Optional[str] = None,
    current_user: dict = Depends(security.get_current_user)
):
    """Get all IoT devices. Restricted to primary developer/farmer account."""
    email = current_user.get("email")
    if email != "timothynduva349@gmail.com":
         return [] # Current demo data is only for Timothy
         
    return iot_service.get_devices(farmer_id)

@router.get("/readings", response_model=list[schemas.SensorReading])
def get_readings(
    device_id: Optional[str] = None,
    sensor_type: Optional[str] = None,
    hours: int = 24,
    current_user: dict = Depends(security.get_current_user)
):
    """Get sensor readings. Restricted to primary developer/farmer account."""
    email = current_user.get("email")
    if email != "timothynduva349@gmail.com":
         return [] # Current demo data is only for Timothy
         
    return iot_service.get_sensor_readings(device_id, sensor_type, hours)

@router.get("/client-hives", response_model=list[schemas.ClientHive])
def get_client_hives(
    current_user: dict = Depends(security.get_current_user)
):
    """Get client hives for the logged-in user."""
    user_id = current_user.get("sub")
    return iot_service.get_client_hives(user_id)

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: dict = Depends(security.get_current_user)
):
    """Get dashboard stats for the logged-in user."""
    user_id = current_user.get("sub")
    return iot_service.get_dashboard_stats(user_id)
@router.post("/devices", response_model=schemas.IoTDevice)
def create_device(
    device_in: schemas.IoTDeviceCreate,
    current_user: dict = Depends(security.get_current_user)
):
    """Create (link) an IoT device to a farmer account."""
    # For now, we only allow Timothy to add devices in this demo
    email = current_user.get("email")
    if email != "timothynduva349@gmail.com":
         raise HTTPException(status_code=403, detail="Not authorized to link devices")
         
    return iot_service.create_device(device_in.dict())
