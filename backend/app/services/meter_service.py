from typing import List, Optional, Dict, Any
from app.db.supabase_db import db_select, db_insert, db_get_by_id, db_update
from datetime import datetime

class MeterService:
    @staticmethod
    def get_buildings() -> List[Dict[str, Any]]:
        return db_select("meters_buildings", order_by="name")

    @staticmethod
    def get_apartments(building_id: Optional[str] = None) -> List[Dict[str, Any]]:
        filters = {}
        if building_id:
            filters["building_id"] = building_id
        return db_select("meters_apartments", filters=filters, order_by="unit_number")

    @staticmethod
    def get_meters(
        building_id: Optional[str] = None, 
        apartment_id: Optional[str] = None,
        meter_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        filters = {}
        if building_id:
            filters["building_id"] = building_id
        if apartment_id:
            filters["apartment_id"] = apartment_id
        if meter_type:
            filters["meter_type"] = meter_type
            
        return db_select("meters_devices", filters=filters, order_by="meter_number")

    @staticmethod
    def get_readings(meter_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        return db_select(
            "meters_readings", 
            filters={"meter_id": meter_id}, 
            limit=limit, 
            order_by="timestamp", 
            ascending=False
        )

    @staticmethod
    def get_billing_rates() -> List[Dict[str, Any]]:
        return db_select("meters_billing_rates", filters={"is_active": True})

    @staticmethod
    def get_events(severity: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        filters = {}
        if severity:
            filters["severity"] = severity
        return db_select("meters_events", filters=filters, limit=limit, order_by="timestamp", ascending=False)

    @staticmethod
    def update_meter_reading(meter_id: str, value: float, unit: str):
        # 1. Insert new reading
        db_insert("meters_readings", {
            "meter_id": meter_id,
            "value": value,
            "unit": unit,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # 2. Update last reading in meter device
        db_update("meters_devices", meter_id, {
            "last_reading_value": value,
            "last_reading_unit": unit,
            "last_reading_at": datetime.utcnow().isoformat()
        })
