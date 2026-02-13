from typing import List, Optional, Dict, Any
from datetime import datetime
from app.db.supabase_db import db_select, db_insert

async def get_devices(farmer_id: Optional[str] = None, token: Optional[str] = None) -> List[Dict[str, Any]]:
    filters = {}
    if farmer_id:
        filters["farmer_id"] = farmer_id
    return await db_select("iot_devices", filters=filters, order_by="created_at", token=token)

async def get_sensor_readings(
    device_id: Optional[str] = None, 
    sensor_type: Optional[str] = None,
    hours: int = 24,
    token: Optional[str] = None
) -> List[Dict[str, Any]]:
    filters = {}
    if device_id:
        filters["device_id"] = device_id
    if sensor_type:
        filters["sensor_type"] = sensor_type
        
    # Note: Using 'recorded_at' as the actual DB column name
    readings = await db_select("sensor_readings", filters=filters, limit=500, order_by="recorded_at", ascending=False, token=token)
    
    # Map 'recorded_at' to 'timestamp' for frontend compatibility
    for r in readings:
        if "recorded_at" in r and "timestamp" not in r:
            r["timestamp"] = r["recorded_at"]
            
    return readings

async def get_client_hives(user_id: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
    return await db_select("client_hives", filters={"user_id": user_id}, order_by="created_at", token=token)

async def get_dashboard_stats(user_id: str, token: Optional[str] = None) -> Dict[str, Any]:
    devices = await get_devices(token=token)
    readings = await get_sensor_readings(hours=24, token=token)
    
    active_devices = [d for d in devices if d.get("status") == "active"]
    infield = [r for r in readings if r.get("sensor_type") == "infield"]
    inland = [r for r in readings if r.get("sensor_type") == "inland"]
    disease = [r for r in readings if r.get("sensor_type") == "disease"]
    
    avg_temp = sum(r.get("readings", {}).get("temperature", 0) for r in infield) / len(infield) if infield else 0
    avg_hum = sum(r.get("readings", {}).get("humidity", 0) for r in infield) / len(infield) if infield else 0
    avg_weight = sum(r.get("readings", {}).get("hive_weight", 0) for r in inland) / len(inland) if inland else 0
    health_score = sum(r.get("readings", {}).get("colony_health_score", 0) for r in disease) / len(disease) if disease else 0
    
    return {
        "totalDevices": len(devices),
        "activeDevices": len(active_devices),
        "totalReadings": len(readings),
        "lastUpdate": readings[0].get("timestamp") if readings else datetime.utcnow().isoformat(),
        "avgTemperature": round(avg_temp, 1),
        "avgHumidity": round(avg_hum, 1),
        "avgHiveWeight": round(avg_weight, 1),
        "healthScore": round(health_score)
    }

async def create_device(data: Dict[str, Any], token: Optional[str] = None) -> Dict[str, Any]:
    if "status" not in data:
        data["status"] = "active"
    if "battery_level" not in data:
        data["battery_level"] = 100
    if "firmware_version" not in data:
        data["firmware_version"] = "1.0.0"
    if "last_ping" not in data:
        data["last_ping"] = datetime.utcnow().isoformat()
        
    result = await db_insert("iot_devices", data, token=token)
    if result.get("success"):
        return result["data"][0] if result.get("data") else data
    return data
