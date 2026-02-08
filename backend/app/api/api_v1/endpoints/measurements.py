from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from app.api.deps import get_current_active_user
from app.db.supabase_db import db_select, db_insert
from app.models.user import User

router = APIRouter()

@router.get("/hive/{hive_id}")
async def get_hive_metrics(
    hive_id: str,
    time_range: str = Query("7d", description="Time range (e.g., 24h, 7d, 30d)"),
    current_user: User = Depends(get_current_active_user)
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
    results = db_select(
        "sensor_readings",
        columns="recorded_at, weight_kg, temp_internal, humidity_internal, acoustic_freq",
        filters={
            "hive_id": hive_id,
            "recorded_at": f"gte.{start_time}",
            "user_id": current_user.id
        },
        order_by="recorded_at",
        ascending=True,
        limit=1000
    )
    
    return results

@router.get("/land/{apiary_id}")
async def get_land_metrics(
    apiary_id: str,
    time_range: str = Query("7d", description="Time range"),
    current_user: User = Depends(get_current_active_user)
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
    
    results = db_select(
        "land_readings",
        columns="recorded_at, soil_moisture, rainfall_mm, ambient_temp, wind_speed_kmh",
        filters={
            "apiary_id": apiary_id,
            "recorded_at": f"gte.{start_time}",
            "user_id": current_user.id
        },
        order_by="recorded_at",
        ascending=True,
        limit=1000
    )
    
    return results

@router.get("/diseases/radar")
async def get_disease_radar(
    hive_id: Optional[str] = None,
    severity: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Fetch disease detection events.
    """
    filters = {"user_id": current_user.id}
    if hive_id:
        filters["hive_id"] = hive_id
    if severity:
        filters["severity"] = severity
        
    results = db_select(
        "disease_detections",
        filters=filters,
        order_by="detected_at",
        ascending=False,
        limit=100
    )
    
    return results
