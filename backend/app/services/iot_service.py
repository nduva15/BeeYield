from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.db.supabase_db import db_select, db_insert, db_get_by_id
from app.schemas import iot as schemas

def get_devices(farmer_id: Optional[str] = None) -> List[Dict[str, Any]]:
    filters = {}
    if farmer_id:
        filters["farmer_id"] = farmer_id
    return db_select("iot_devices", filters=filters, order_by="created_at")

def get_sensor_readings(
    device_id: Optional[str] = None, 
    sensor_type: Optional[str] = None,
    hours: int = 24
) -> List[Dict[str, Any]]:
    # In a real system we would filter by timestamp here too
    # For now, using the db_select helper which doesn't support complex time filtering yet
    # but we can filter by device and type
    filters = {}
    if device_id:
        filters["device_id"] = device_id
    if sensor_type:
        filters["sensor_type"] = sensor_type
        
    return db_select("sensor_readings", filters=filters, limit=500, order_by="timestamp")

def get_client_hives(user_id: str) -> List[Dict[str, Any]]:
    return db_select("client_hives", filters={"user_id": user_id}, order_by="created_at")

def get_dashboard_stats(user_id: str) -> Dict[str, Any]:
    # In a real app, this would be optimized queries
    devices = get_devices() # Should probably be filtered by user/farmer
    readings = get_sensor_readings(hours=24)
    
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
        "lastUpdate": readings[0].get("timestamp") if readings else datetime.utcnow(),
        "avgTemperature": round(avg_temp, 1),
        "avgHumidity": round(avg_hum, 1),
        "avgHiveWeight": round(avg_weight, 1),
        "healthScore": round(health_score)
    }
