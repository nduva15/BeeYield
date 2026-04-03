from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import Optional, List
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

@router.get("/devices/{device_id}", response_model=schemas.IoTDevice)
async def get_device(
    device_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """Get a single IoT device by ID (admin or owner)."""
    device = await iot_service.get_device_by_id(device_id, token=token)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    email = current_user.get("email")
    user_id = current_user.get("sub")
    if email != settings.ADMIN_EMAIL and device.get("farmer_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return device

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
    user_id = current_user.get("sub")

    payload = device_in.dict()

    # Admin can link devices to any farmer; non-admin can only link to self.
    if email != settings.ADMIN_EMAIL:
        payload["farmer_id"] = user_id

    return await iot_service.create_device(payload, token=token)

@router.patch("/devices/{device_id}", response_model=schemas.IoTDevice)
async def update_device(
    device_id: str,
    patch: schemas.IoTDeviceUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """Update an IoT device (admin or owner)."""
    existing = await iot_service.get_device_by_id(device_id, token=token)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    email = current_user.get("email")
    user_id = current_user.get("sub")
    if email != settings.ADMIN_EMAIL and existing.get("farmer_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    patch_data = patch.dict(exclude_unset=True)
    # Non-admin cannot reassign ownership
    if email != settings.ADMIN_EMAIL and "farmer_id" in patch_data:
        patch_data.pop("farmer_id", None)

    updated = await iot_service.update_device(device_id, patch_data, token=token)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update device")
    return updated

@router.delete("/devices/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token),
):
    """Delete an IoT device (admin or owner)."""
    existing = await iot_service.get_device_by_id(device_id, token=token)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    email = current_user.get("email")
    user_id = current_user.get("sub")
    if email != settings.ADMIN_EMAIL and existing.get("farmer_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    ok = await iot_service.delete_device(device_id, token=token)
    if not ok:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete device")
    return None

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
    current_user.get("sub")
    current_user.get("email")
    
    # Simple filtering: admins see all, farmers see theirs
    filters = {"resolved": resolved}
    # if email != settings.ADMIN_EMAIL: # Filter by user_id if needed
    
    return await db_select("sensor_alerts", filters=filters, order_by="created_at", ascending=False, token=token)
