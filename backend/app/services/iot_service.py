from typing import List, Optional, Dict, Any
from datetime import datetime
from app.db.supabase_db import db_select, db_insert, db_update, db_delete

async def get_devices(farmer_id: Optional[str] = None, token: Optional[str] = None) -> List[Dict[str, Any]]:
    filters = {}
    if farmer_id:
        filters["farmer_id"] = farmer_id
    return await db_select("iot_devices", filters=filters, order_by="created_at", token=token)

async def get_device_by_id(device_id: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
    rows = await db_select("iot_devices", filters={"id": device_id}, limit=1, token=token)
    if not rows:
        return None
    return rows[0]

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

async def update_device(device_id: str, patch: Dict[str, Any], token: Optional[str] = None) -> Optional[Dict[str, Any]]:
    # Don't allow id overwrite
    patch = {k: v for k, v in (patch or {}).items() if k not in ("id",)}
    if not patch:
        return await get_device_by_id(device_id, token=token)

    # Ensure last_ping is serialized if provided as datetime
    if isinstance(patch.get("last_ping"), datetime):
        patch["last_ping"] = patch["last_ping"].isoformat()

    res = await db_update("iot_devices", patch, {"id": device_id}, token=token)
    if not res.get("success"):
        return None

    rows = res.get("data") or []
    if isinstance(rows, list) and rows:
        return rows[0]

    # Fallback: re-fetch
    return await get_device_by_id(device_id, token=token)

async def delete_device(device_id: str, token: Optional[str] = None) -> bool:
    res = await db_delete("iot_devices", {"id": device_id}, token=token)
    return bool(res.get("success"))

async def check_sensor_health(token: Optional[str] = None) -> Dict[str, Any]:
    """
    Automated health scan for sensors. Generates alerts in sensor_alerts table.
    """
    from datetime import datetime, timedelta
    from app.db.supabase_db import db_select, db_insert
    
    # 1. Fetch active devices and latest readings
    devices = await db_select("iot_devices", filters={"status": "active"}, token=token)
    since_24h = (datetime.utcnow() - timedelta(hours=24)).isoformat()
    raw_readings = await db_select("sensor_readings", limit=200, order_by="recorded_at", ascending=False, token=token)
    
    alerts_spawned = 0
    
    # Simple threshold logic
    for dev in devices:
        dev.get("id")
        # Check connectivity
        last_ping = dev.get("last_ping")
        if not last_ping or last_ping < since_24h:
            await db_insert("sensor_alerts", {
                "hive_id": dev.get("hive_id"),
                "apiary_id": dev.get("apiary_id"),
                "alert_type": "connectivity",
                "severity": "warning",
                "message": f"Sensor {dev.get('device_id')} heartbeat missing for >24h",
                "reading_value": 0,
                "resolved": False
            }, token=token)
            alerts_spawned += 1
            
    # Check data ranges
    for r in raw_readings:
        vals = r.get("readings", {})
        temp = vals.get("temperature") or vals.get("internal_temp")
        if temp and (temp > 40 or temp < 20):
            await db_insert("sensor_alerts", {
                "hive_id": r.get("hive_id"),
                "alert_type": "temperature",
                "severity": "critical" if temp > 42 else "warning",
                "message": f"Abnormal temperature detected: {temp}°C",
                "reading_value": temp,
                "threshold_value": 38,
                "resolved": False
            }, token=token)
            alerts_spawned += 1
            
        weight = vals.get("hive_weight") or vals.get("weight_kg")
        if weight and weight < 1.0: # Empty hive or sensor failure
            await db_insert("sensor_alerts", {
                "hive_id": r.get("hive_id"),
                "alert_type": "weight",
                "severity": "critical",
                "message": "Critical weight loss or sensor malfunction detected",
                "reading_value": weight,
                "threshold_value": 5.0,
                "resolved": False
            }, token=token)
            alerts_spawned += 1

    return {"status": "success", "alerts_spawned": alerts_spawned}
