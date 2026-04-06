from typing import Any, Optional
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
        columns="recorded_at, soil_moisture, rainfall_mm, ambient_temp, wind_speed_kmh, ndvi, notes",
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

@router.post("/diseases/radar", status_code=201)
async def create_disease_detection(
    body: dict,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
) -> Any:
    """
    Create a disease detection event (e.g., Varroa).
    """
    allowed = {"hive_id", "disease_type", "detection_method", "severity", "notes", "metadata"}
    payload = {k: v for k, v in (body or {}).items() if k in allowed}
    if not payload.get("hive_id"):
        raise HTTPException(status_code=400, detail="hive_id is required")

    payload["user_id"] = user_id
    payload.setdefault("detected_at", datetime.utcnow().isoformat())

    res = await db_insert("disease_detections", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create disease detection"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.get("/varroa/readings")
async def get_varroa_readings(
    hive_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
) -> Any:
    """
    Fetch dedicated Varroa reading records for the authenticated user.
    """
    filters: dict[str, Any] = {"user_id": user_id}
    if hive_id:
        filters["hive_id"] = hive_id

    results = await db_select(
        "varroa_readings",
        filters=filters,
        order_by="reading_date",
        ascending=False,
        limit=200,
        token=token,
    )
    return results


@router.post("/varroa/readings", status_code=201)
async def create_varroa_reading(
    body: dict,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
) -> Any:
    """
    Create a dedicated Varroa reading row.
    """
    hive_id = body.get("hive_id")
    if not hive_id:
        raise HTTPException(status_code=400, detail="hive_id is required")

    mite_count = int(body.get("mite_count") or 0)
    sample_size = int(body.get("sample_size") or 300)
    infestation_rate = round((mite_count / sample_size) * 100, 2) if sample_size > 0 else 0

    payload = {
        "hive_id": hive_id,
        "user_id": user_id,
        "reading_date": body.get("reading_date") or datetime.utcnow().date().isoformat(),
        "method": body.get("method") or "alcohol_wash",
        "mite_count": mite_count,
        "sample_size": sample_size,
        "infestation_rate": body.get("infestation_rate", infestation_rate),
        "inspector_name": body.get("inspector_name"),
        "notes": body.get("notes"),
    }

    res = await db_insert("varroa_readings", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create Varroa reading"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.get("/varroa/treatments")
async def get_varroa_treatments(
    hive_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
) -> Any:
    """
    Fetch dedicated Varroa treatment records for the authenticated user.
    """
    filters: dict[str, Any] = {"user_id": user_id}
    if hive_id:
        filters["hive_id"] = hive_id

    results = await db_select(
        "varroa_treatments",
        filters=filters,
        order_by="start_date",
        ascending=False,
        limit=200,
        token=token,
    )
    return results


@router.post("/varroa/treatments", status_code=201)
async def create_varroa_treatment(
    body: dict,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
) -> Any:
    """
    Create a dedicated Varroa treatment row.
    """
    hive_id = body.get("hive_id")
    treatment_type = body.get("treatment_type")

    if not hive_id:
        raise HTTPException(status_code=400, detail="hive_id is required")
    if not treatment_type:
        raise HTTPException(status_code=400, detail="treatment_type is required")

    payload = {
        "hive_id": hive_id,
        "user_id": user_id,
        "treatment_type": treatment_type,
        "start_date": body.get("start_date") or datetime.utcnow().date().isoformat(),
        "end_date": body.get("end_date"),
        "dosage": body.get("dosage"),
        "effectiveness_percent": body.get("effectiveness_percent"),
        "notes": body.get("notes"),
    }

    res = await db_insert("varroa_treatments", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create Varroa treatment"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload

