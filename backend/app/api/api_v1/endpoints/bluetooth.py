
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from typing import Any, Optional, List
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.core import security
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

router = APIRouter()

class BluetoothDeviceCreate(BaseModel):
    mac_address: str
    name: str = "New Sensor"
    device_type: str = "scale"
    assigned_hive_id: Optional[UUID] = None

class ReadingBuffer(BaseModel):
    device_mac: str
    recorded_at: datetime
    temp_c: Optional[float] = None
    weight_kg: Optional[float] = None
    humidity: Optional[float] = None

class SyncPayload(BaseModel):
    readings: List[ReadingBuffer]

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

@router.get("/devices", response_model=List[dict])
async def get_bluetooth_devices(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Get all bluetooth devices paired by the user."""
    return await db_select("bluetooth_devices", filters={"user_id": user_id}, token=token)

@router.post("/devices", response_model=dict)
async def register_bluetooth_device(
    device_in: BluetoothDeviceCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Register or update a bluetooth device."""
    data = device_in.dict()
    data["user_id"] = user_id
    
    # Check if exists
    existing = await db_select("bluetooth_devices", filters={"mac_address": data["mac_address"]}, token=token)
    if existing:
        if existing[0].get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Device already registered to another user")
        # Update
        result = await db_update("bluetooth_devices", data, {"mac_address": data["mac_address"]}, token=token)
    else:
        # Insert
        result = await db_insert("bluetooth_devices", data, token=token)
        
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "DB Error"))
    
    return result["data"][0] if result.get("data") else data

@router.post("/sync", status_code=status.HTTP_201_CREATED)
async def sync_readings(
    payload: SyncPayload,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """Upload buffered sensor readings fetched via Bluetooth."""
    # Verify ownership of device
    device_macs = set(r.device_mac for r in payload.readings)
    for mac in device_macs:
        devices = await db_select("bluetooth_devices", filters={"mac_address": mac, "user_id": user_id}, token=token)
        if not devices:
            raise HTTPException(status_code=403, detail=f"Ownership of device {mac} not verified")
            
    # Bulk insert readings
    data = [r.dict() for r in payload.readings]
    # Pydantic datetime might need string conversion depending on db_insert implementation
    for item in data:
        if isinstance(item.get("recorded_at"), datetime):
            item["recorded_at"] = item["recorded_at"].isoformat()
            
    result = await db_insert("sensor_readings_buffer", data, token=token)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "DB Error"))
        
    return {"status": "success", "count": len(data)}

