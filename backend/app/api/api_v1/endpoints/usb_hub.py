from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.db.supabase_db import db_select, db_insert, db_update
from app.core import security

router = APIRouter()

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id

class HubDeviceRegister(BaseModel):
    serial_number: str
    firmware_version: Optional[str] = "1.0.0"
    config_json: Optional[Dict[str, Any]] = {}

class SyncSessionStart(BaseModel):
    hub_sn: str
    records_count: int

class SyncSessionComplete(BaseModel):
    session_id: str
    status: str
    duration_sec: int

@router.post("/handshake", response_model=dict)
def handshake_device(
    device: HubDeviceRegister,
    user_id: str = Depends(get_user_id)
):
    """
    Handle USB device connection.
    Register if new, update last_connected if exists.
    """
    # Check if device exists
    existing = db_select("hub_devices", filters={"serial_number": device.serial_number})
    
    if existing:
        hub = existing[0]
        # Verify ownership
        if hub["user_id"] != user_id:
             raise HTTPException(status_code=403, detail="Device registered to another user")
        
        # Update connection info
        update_data = {
            "last_connected_at": datetime.utcnow().isoformat(),
            "firmware_version": device.firmware_version
        }
        db_update("hub_devices", update_data, {"serial_number": device.serial_number})
        
        return {"status": "connected", "device": hub, "is_new": False}
    else:
        # Register new device
        new_hub = {
            "serial_number": device.serial_number,
            "user_id": user_id,
            "firmware_version": device.firmware_version,
            "last_connected_at": datetime.utcnow().isoformat(),
            "config_json": device.config_json or {}
        }
        res = db_insert("hub_devices", new_hub)
        if not res.get("success"):
            raise HTTPException(status_code=500, detail="Failed to register device")
            
        return {"status": "registered", "device": res["data"][0], "is_new": True}

@router.post("/sync/start", response_model=dict)
def start_sync_session(
    session: SyncSessionStart,
    user_id: str = Depends(get_user_id)
):
    """Start a data sync session"""
    # Verify ownership
    hub = db_select("hub_devices", filters={"serial_number": session.hub_sn, "user_id": user_id})
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found or access denied")
        
    # Create session
    new_session = {
        "hub_sn": session.hub_sn,
        "user_id": user_id,
        "records_processed": session.records_count,
        "status": "pending",
        "started_at": datetime.utcnow().isoformat()
    }
    
    res = db_insert("sync_sessions", new_session)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail="Failed to start sync session")
        
    return res["data"][0] if res.get("data") else new_session

@router.post("/sync/complete", response_model=dict)
def complete_sync_session(
    data: SyncSessionComplete,
    user_id: str = Depends(get_user_id)
):
    """Complete a sync session"""
    # Verify session ownership
    sess = db_select("sync_sessions", filters={"id": data.session_id, "user_id": user_id})
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
        
    update_data = {
        "status": data.status,
        "duration_sec": data.duration_sec,
        "finished_at": datetime.utcnow().isoformat()
    }
    
    res = db_update("sync_sessions", update_data, {"id": data.session_id})
    
    # Update hub last_sync_at if success
    if data.status.lower() == "success":
        hub_sn = sess[0]["hub_sn"]
        db_update("hub_devices", {"last_sync_at": datetime.utcnow().isoformat()}, {"serial_number": hub_sn})
        
    return res["data"][0] if res.get("data") else {"status": "ok"}

@router.get("/devices", response_model=List[dict])
def get_my_devices(user_id: str = Depends(get_user_id)):
    """Get all devices owned by user"""
    return db_select("hub_devices", filters={"user_id": user_id})
