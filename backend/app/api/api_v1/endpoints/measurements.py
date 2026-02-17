from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from datetime import datetime, timedelta
from app.db.supabase_db import db_select, db_insert
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

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

@router.get("/hive/{hive_id}")
async def get_hive_metrics(
    hive_id: str,
    time_range: str = Query("7d", description="Time range (e.g., 24h, 7d, 30d)"),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
) -> Any:
    """
    Fetch time-series sensor readings for a specific hive.
    """
    # Calculate start time
    days = 7
    if time_range == "24h":
        days = 1
    elif time_range == "30d":
        days = 30
    
    start_time = (datetime.now() - timedelta(days=days)).isoformat()
    
    # query results
    results = await db_select(
        "sensor_readings",
        columns="recorded_at, weight_kg, temp_internal, humidity_internal, acoustic_freq",
        filters={
            "hive_id": hive_id,
            "recorded_at": f"gte.{start_time}",
            "user_id": user_id
        },
        order_by="recorded_at",
        ascending=True,
        limit=1000,
        token=token
    )
    
    return results

@router.get("/land/{apiary_id}")
async def get_land_metrics(
    apiary_id: str,
    time_range: str = Query("7d", description="Time range"),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
) -> Any:
    """
    Fetch land/environmental readings for an apiary.
    """
    days = 7
    if time_range == "24h":
        days = 1
    elif time_range == "30d":
        days = 30
    
    start_time = (datetime.now() - timedelta(days=days)).isoformat()
    
    results = await db_select(
        "land_readings",
        columns="recorded_at, soil_moisture, rainfall_mm, ambient_temp, wind_speed_kmh",
        filters={
            "apiary_id": apiary_id,
            "recorded_at": f"gte.{start_time}",
            "user_id": user_id
        },
        order_by="recorded_at",
        ascending=True,
        limit=1000,
        token=token
    )
    
    return results

@router.get("/diseases/radar")
async def get_disease_radar(
    hive_id: Optional[str] = None,
    severity: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
) -> Any:
    """
    Fetch disease detection events.
    """
    filters = {"user_id": user_id}
    if hive_id:
        filters["hive_id"] = hive_id
    if severity:
        filters["severity"] = severity
        
    results = await db_select(
        "disease_detections",
        filters=filters,
        order_by="detected_at",
        ascending=False,
        limit=100,
        token=token
    )
    
    return results

