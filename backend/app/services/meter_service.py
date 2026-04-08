from datetime import datetime
from typing import Any, Dict, List, Optional

from app.db.supabase_db import db_delete, db_insert, db_select, db_update


class MeterService:
    METER_TYPES = {
        "WATER": "Water",
        "HEAT": "Heat",
        "ENERGY": "Energy",
        "OTHER": "Other",
    }

    METER_STATUSES = {
        "OK": "OK",
        "OFFLINE": "Offline",
        "MAINTENANCE": "Maintenance",
        "ALERT": "Alert",
    }

    @staticmethod
    def _clean_optional_string(value: Any) -> Optional[str]:
        if value is None:
            return None

        cleaned = str(value).strip()
        return cleaned or None

    @staticmethod
    def _normalize_meter_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(payload)

        if "meter_number" in normalized:
            meter_number = MeterService._clean_optional_string(normalized.get("meter_number"))
            if not meter_number:
                raise Exception("Meter number is required")
            normalized["meter_number"] = meter_number

        if "building_id" in normalized:
            building_id = MeterService._clean_optional_string(normalized.get("building_id"))
            if not building_id:
                raise Exception("A site is required")
            normalized["building_id"] = building_id

        if "meter_code" in normalized:
            normalized["meter_code"] = MeterService._clean_optional_string(normalized.get("meter_code"))

        if "apartment_id" in normalized:
            apartment_id = normalized.get("apartment_id")
            normalized["apartment_id"] = None if apartment_id in (None, "", "none") else str(apartment_id)

        if "install_date" in normalized and normalized.get("install_date") in ("", None):
            normalized["install_date"] = None

        if "meter_type" in normalized and normalized.get("meter_type") is not None:
            raw_meter_type = str(normalized["meter_type"]).strip().upper()
            if raw_meter_type not in MeterService.METER_TYPES:
                raise Exception("Invalid meter type")
            normalized["meter_type"] = MeterService.METER_TYPES[raw_meter_type]

        if "status" in normalized and normalized.get("status") is not None:
            raw_status = str(normalized["status"]).strip().upper()
            if raw_status not in MeterService.METER_STATUSES:
                raise Exception("Invalid meter status")
            normalized["status"] = MeterService.METER_STATUSES[raw_status]

        return normalized

    @staticmethod
    async def _get_building(building_id: str) -> Optional[Dict[str, Any]]:
        rows = await db_select("meters_buildings", filters={"id": building_id}, limit=1)
        return rows[0] if rows else None

    @staticmethod
    async def _get_apartment(apartment_id: str) -> Optional[Dict[str, Any]]:
        rows = await db_select("meters_apartments", filters={"id": apartment_id}, limit=1)
        return rows[0] if rows else None

    @staticmethod
    async def _validate_meter_location(building_id: str, apartment_id: Optional[str]) -> None:
        building = await MeterService._get_building(building_id)
        if not building:
            known_buildings = await db_select("meters_buildings", limit=1)
            if known_buildings:
                raise Exception("Selected site does not exist")
            return

        if apartment_id:
            apartment = await MeterService._get_apartment(apartment_id)
            if not apartment:
                raise Exception("Selected hive or station does not exist")
            if apartment.get("building_id") != building_id:
                raise Exception("Selected hive or station does not belong to the chosen site")

    @staticmethod
    async def _ensure_unique_meter(
        meter_number: str,
        building_id: str,
        meter_type: str,
        meter_code: Optional[str] = None,
        exclude_id: Optional[str] = None,
    ) -> None:
        existing = await db_select(
            "meters_devices",
            filters={"meter_number": meter_number, "building_id": building_id, "meter_type": meter_type},
            limit=20,
        )
        for row in existing:
            if row.get("id") != exclude_id:
                raise Exception("A meter with this number already exists for the selected site")

        if meter_code:
            existing_codes = await db_select("meters_devices", filters={"meter_code": meter_code}, limit=20)
            for row in existing_codes:
                if row.get("id") != exclude_id:
                    raise Exception("A meter with this code already exists")

    @staticmethod
    async def get_buildings() -> List[Dict[str, Any]]:
        return await db_select("meters_buildings", order_by="name")

    @staticmethod
    async def get_apartments(building_id: Optional[str] = None) -> List[Dict[str, Any]]:
        filters = {}
        if building_id:
            filters["building_id"] = building_id
        return await db_select("meters_apartments", filters=filters, order_by="unit_number")

    @staticmethod
    async def get_meters(
        building_id: Optional[str] = None,
        apartment_id: Optional[str] = None,
        meter_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        filters = {}
        if building_id:
            filters["building_id"] = building_id
        if apartment_id:
            filters["apartment_id"] = apartment_id
        if meter_type:
            filters["meter_type"] = meter_type

        return await db_select("meters_devices", filters=filters, order_by="meter_number")

    @staticmethod
    async def get_meter(meter_id: str) -> Optional[Dict[str, Any]]:
        rows = await db_select("meters_devices", filters={"id": meter_id}, limit=1)
        return rows[0] if rows else None

    @staticmethod
    async def get_readings(meter_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        return await db_select(
            "meters_readings",
            filters={"meter_id": meter_id},
            limit=limit,
            order_by="timestamp",
            ascending=False,
        )

    @staticmethod
    async def create_reading(payload: Dict[str, Any]) -> Dict[str, Any]:
        meter_id = MeterService._clean_optional_string(payload.get("meter_id"))
        if not meter_id:
            raise Exception("Meter is required")

        meter = await MeterService.get_meter(meter_id)
        if not meter:
            raise Exception("Meter not found")

        try:
            value = float(payload.get("value"))
        except (TypeError, ValueError):
            raise Exception("Reading value must be numeric")

        unit = MeterService._clean_optional_string(payload.get("unit"))
        if not unit:
            raise Exception("Reading unit is required")

        timestamp = payload.get("timestamp") or datetime.utcnow().isoformat()
        reading_payload = {
            "meter_id": meter_id,
            "value": value,
            "unit": unit,
            "timestamp": timestamp,
            "reading_type": MeterService._clean_optional_string(payload.get("reading_type")) or "MANUAL",
        }

        res = await db_insert("meters_readings", reading_payload)
        if not res.get("success"):
            raise Exception(res.get("error") or "Failed to create reading")

        update_res = await db_update(
            "meters_devices",
            {
                "last_reading_value": value,
                "last_reading_unit": unit,
                "last_reading_at": timestamp,
            },
            {"id": meter_id},
        )
        if not update_res.get("success"):
            raise Exception(update_res.get("error") or "Failed to refresh meter snapshot")

        rows = res.get("data") or []
        return rows[0] if isinstance(rows, list) and rows else reading_payload

    @staticmethod
    async def get_billing_rates() -> List[Dict[str, Any]]:
        return await db_select("meters_billing_rates", filters={"is_active": True})

    @staticmethod
    async def get_billing_rate(rate_id: str) -> Optional[Dict[str, Any]]:
        rows = await db_select("meters_billing_rates", filters={"id": rate_id}, limit=1)
        return rows[0] if rows else None

    @staticmethod
    async def create_billing_rate(payload: Dict[str, Any]) -> Dict[str, Any]:
        res = await db_insert("meters_billing_rates", payload)
        if not res.get("success"):
            raise Exception(res.get("error") or "Failed to create billing rate")
        rows = res.get("data") or []
        return rows[0] if isinstance(rows, list) and rows else payload

    @staticmethod
    async def update_billing_rate(rate_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not payload:
            return await MeterService.get_billing_rate(rate_id)
        res = await db_update("meters_billing_rates", payload, {"id": rate_id})
        if not res.get("success"):
            raise Exception(res.get("error") or "Failed to update billing rate")
        return await MeterService.get_billing_rate(rate_id) or (res.get("data") or [None])[0]

    @staticmethod
    async def delete_billing_rate(rate_id: str) -> bool:
        res = await db_delete("meters_billing_rates", {"id": rate_id})
        return bool(res.get("success"))

    @staticmethod
    async def get_events(severity: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        filters = {}
        if severity:
            filters["severity"] = severity
        return await db_select("meters_events", filters=filters, limit=limit, order_by="timestamp", ascending=False)

    @staticmethod
    async def update_meter_reading(meter_id: str, value: float, unit: str):
        await db_insert(
            "meters_readings",
            {"meter_id": meter_id, "value": value, "unit": unit, "timestamp": datetime.utcnow().isoformat()},
        )

        await db_update(
            "meters_devices",
            {
                "last_reading_value": value,
                "last_reading_unit": unit,
                "last_reading_at": datetime.utcnow().isoformat(),
            },
            {"id": meter_id},
        )

    @staticmethod
    async def create_meter(payload: Dict[str, Any]) -> Dict[str, Any]:
        normalized = MeterService._normalize_meter_payload(payload)
        await MeterService._validate_meter_location(normalized["building_id"], normalized.get("apartment_id"))
        await MeterService._ensure_unique_meter(
            normalized["meter_number"],
            normalized["building_id"],
            normalized["meter_type"],
            normalized.get("meter_code"),
        )

        res = await db_insert("meters_devices", normalized)
        if not res.get("success"):
            raise Exception(res.get("error") or "Failed to create meter")
        rows = res.get("data") or []
        return rows[0] if isinstance(rows, list) and rows else normalized

    @staticmethod
    async def update_meter(meter_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        current = await MeterService.get_meter(meter_id)
        if not current:
            return None

        if not payload:
            return current

        normalized = MeterService._normalize_meter_payload(payload)
        merged = {**current, **normalized}

        await MeterService._validate_meter_location(merged["building_id"], merged.get("apartment_id"))
        await MeterService._ensure_unique_meter(
            merged["meter_number"],
            merged["building_id"],
            merged["meter_type"],
            merged.get("meter_code"),
            exclude_id=meter_id,
        )

        res = await db_update("meters_devices", normalized, {"id": meter_id})
        if not res.get("success"):
            raise Exception(res.get("error") or "Failed to update meter")
        return await MeterService.get_meter(meter_id) or (res.get("data") or [None])[0]

    @staticmethod
    async def delete_meter(meter_id: str) -> bool:
        res = await db_delete("meters_devices", {"id": meter_id})
        return bool(res.get("success"))
