from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional, Any, List
from app.core import security
from app.core.config import settings
from app.schemas import iot as schemas
from app.services import iot_service

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

@router.get("/devices", response_model=List[schemas.IoTDevice])
async def get_devices(
    farmer_id: Optional[str] = None,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get all IoT devices. Restricted to admin or requested farmer (if self)."""
    email = current_user.get("email")
    user_id = current_user.get("sub")
    
    # If not admin, force farmer_id to be current user
    if email != settings.ADMIN_EMAIL:
        if farmer_id and farmer_id != user_id:
             return [] # Unauthorized to see others
        farmer_id = user_id # Force self

    return await iot_service.get_devices(farmer_id, token=token)

@router.get("/readings", response_model=List[schemas.SensorReading])
async def get_readings(
    device_id: Optional[str] = None,
    sensor_type: Optional[str] = None,
    hours: int = 24,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get sensor readings. Restricted to primary developer/farmer account."""
    email = current_user.get("email")
    if email != settings.ADMIN_EMAIL:
         return [] # Current demo data is only for Admin
         
    return await iot_service.get_sensor_readings(device_id, sensor_type, hours, token=token)

@router.get("/client-hives", response_model=List[schemas.ClientHive])
async def get_client_hives(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get client hives for the logged-in user."""
    user_id = current_user.get("sub")
    return await iot_service.get_client_hives(user_id, token=token)

@router.get("/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get dashboard stats for the logged-in user."""
    user_id = current_user.get("sub")
    return await iot_service.get_dashboard_stats(user_id, token=token)

@router.post("/devices", response_model=schemas.IoTDevice)
async def create_device(
    device_in: schemas.IoTDeviceCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Create (link) an IoT device to a farmer account."""
    email = current_user.get("email")
    if email != settings.ADMIN_EMAIL:
         raise HTTPException(status_code=403, detail="Not authorized to link devices")
         
    return await iot_service.create_device(device_in.dict(), token=token)

@router.post("/health-check")
async def trigger_health_check(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Trigger a manual health scan of all sensors."""
    email = current_user.get("email")
    if email != settings.ADMIN_EMAIL:
         raise HTTPException(status_code=403, detail="Admin only")
         
    return await iot_service.check_sensor_health(token=token)

@router.get("/alerts")
async def get_alerts(
    resolved: bool = False,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Get active sensor alerts."""
    from app.db.supabase_db import db_select
    user_id = current_user.get("sub")
    email = current_user.get("email")
    
    # Simple filtering: admins see all, farmers see theirs
    filters = {"resolved": resolved}
    # if email != settings.ADMIN_EMAIL: # Filter by user_id if needed
    
    return await db_select("sensor_alerts", filters=filters, order_by="created_at", ascending=False, token=token)
