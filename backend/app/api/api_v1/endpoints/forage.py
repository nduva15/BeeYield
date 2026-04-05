from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from typing import Optional, List, Any
from datetime import datetime
from app.core import security
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.schemas import forage as schemas

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")
    return str(user_id)


# ============================================
# FORAGE ZONES (CRUD)
# ============================================

@router.get("/zones", response_model=List[schemas.ForageZone])
async def list_forage_zones(
    apiary_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    filters: dict[str, Any] = {"user_id": user_id}
    if apiary_id:
        filters["apiary_id"] = apiary_id
    return await db_select("forage_zones", filters=filters, order_by="created_at", ascending=False, limit=1000, token=token)


@router.get("/zones/{zone_id}", response_model=schemas.ForageZone)
async def get_forage_zone(
    zone_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Forage zone not found")
    return rows[0]


@router.post("/zones", response_model=schemas.ForageZone, status_code=status.HTTP_201_CREATED)
async def create_forage_zone(
    body: schemas.ForageZoneCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = body.model_dump(mode="json")
    payload["user_id"] = user_id
    res = await db_insert("forage_zones", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create forage zone"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.patch("/zones/{zone_id}", response_model=schemas.ForageZone)
async def update_forage_zone(
    zone_id: str,
    body: schemas.ForageZoneUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Forage zone not found")

    patch = body.model_dump(exclude_unset=True, mode="json")
    if not patch:
        return existing[0]
    patch["updated_at"] = datetime.utcnow().isoformat()

    res = await db_update("forage_zones", patch, {"id": zone_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update forage zone"))
    rows = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    return rows[0] if rows else {**existing[0], **patch}


@router.delete("/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forage_zone(
    zone_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    existing = await db_select("forage_zones", filters={"id": zone_id, "user_id": user_id}, limit=1, token=token)
    if not existing:
        raise HTTPException(status_code=404, detail="Forage zone not found")

    res = await db_delete("forage_zones", {"id": zone_id, "user_id": user_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete forage zone"))
    return None

@router.get("/potential")
async def get_flight_potential(
    apiary_id: str = Query(..., description="Target apiary ID"),
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Calculates foraging potential based on local flower sources and current weather.
    Formula: Potential = (Nectar Score * Bloom Match) * Weather Modifier
    """
    # 1. Get Apiary Location
    apiaries = await db_select("apiaries", filters={"id": apiary_id}, token=token)
    if not apiaries:
        raise HTTPException(status_code=404, detail="Apiary not found")
    apiaries[0]
    
    # 2. Get Local Flower Sources (Bloom Schedule)
    # For now we fetch all and filter by current month
    current_month = datetime.now().month
    flower_sources = await db_select("flower_sources", token=token)
    
    # 3. Get Current Weather (Agro-Meteo)
    # We fetch the latest reading for this apiary
    weather_readings = await db_select("agro_meteo_readings", filters={"apiary_id": apiary_id}, order_by="recorded_at", ascending=False, limit=1, token=token)
    
    if not weather_readings:
        # Fallback to general sensor readings if agro_meteo is empty
        weather_readings = await db_select("sensor_readings", filters={"apiary_id": apiary_id}, order_by="recorded_at", ascending=True, limit=1, token=token)
    
    weather = weather_readings[0] if weather_readings else None
    
    # Logic:
    potential_score = 0
    active_sources = []
    temp = weather.get("temperature", 20.0) if weather else 20.0
    humidity = weather.get("humidity", 50.0) if weather else 50.0
    
    # Weather Modifier: 
    # Bees stop foraging below 10C or above 38C
    # Rain (high humidity + rainfall) washes out nectar
    weather_mod = 1.0
    if temp < 10:
        weather_mod = 0.1
    elif temp < 15:
        weather_mod = 0.5
    elif temp > 35:
        weather_mod = 0.7
    
    if humidity > 80:
        weather_mod *= 0.4 # Rain/High moisture
    
    for fs in flower_sources:
        is_blooming = False
        start = fs.get("bloom_start_month", 1)
        end = fs.get("bloom_end_month", 12)
        
        if start <= end:
            is_blooming = start <= current_month <= end
        else: # Wrap around year
            is_blooming = current_month >= start or current_month <= end
            
        if is_blooming:
            # Check temp range for this flower
            flower_potential = fs.get("nectar_potential", 0.5)
            t_min = fs.get("optimal_temp_min", 15.0)
            t_max = fs.get("optimal_temp_max", 30.0)
            
            if not (t_min <= temp <= t_max):
                flower_potential *= 0.6
                
            potential_score = max(potential_score, flower_potential * weather_mod)
            active_sources.append({
                "name": fs["name"],
                "potential": flower_potential,
                "is_optimal": t_min <= temp <= t_max
            })

    return {
        "score": round(potential_score * 100, 2),
        "weather": {
            "temp": temp,
            "humidity": humidity,
            "status": "Optimal" if weather_mod > 0.8 else "Sub-optimal" if weather_mod > 0.4 else "Poor"
        },
        "active_sources": active_sources,
        "recommendation": "High forage activity expected." if potential_score > 0.7 else "Normal activity." if potential_score > 0.3 else "Forage activity limited by environment."
    }

@router.get("/weather")
async def get_realtime_weather(
    lat: float,
    lng: float,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Fetches real-time weather metrics for a specific coordinate.
    In a production app, this would call OpenWeatherMap or similar.
    Here we return high-fidelity mock data based on location.
    """
    # Deterministic mock based on coordinates
    seed = abs(int(lat * 100 + lng * 100)) % 100
    temp = 20 + (seed % 15)
    humidity = 40 + (seed % 40)
    solar = 800 + (seed * 2) # Solar pressure W/m2
    
    return {
        "temperature": temp,
        "humidity": humidity,
        "solar_pressure": solar,
        "wind_speed": seed % 10,
        "description": "Clear Sky" if seed < 50 else "Partly Cloudy" if seed < 80 else "Overcast",
        "bee_flight_status": "Enabled" if temp > 12 and humidity < 85 else "Disabled (Temp)" if temp <= 12 else "Disabled (Rain)"
    }
