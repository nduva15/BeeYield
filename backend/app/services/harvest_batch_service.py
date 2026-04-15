"""
Harvest Batching Service — Rust-Accelerated (Post-Oxidize)
=========================================================
Batch ID generation and Record Compilation ported to `beeyield_core.HarvestBatcher`.
Async database fetches remain in Python.
"""
import re
from datetime import datetime
from typing import Any, Optional, Dict
from app.core.config import settings
from app.db.supabase_db import db_select, db_insert

from beeyield_core import HarvestBatcher as _RustBatcher  # type: ignore
_batcher = _RustBatcher()


def _write_token(token: Optional[str]) -> Optional[str]:
    return getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", None) or token


def _normalize_apiary_name(name: Optional[str]) -> str:
    if not name:
        return "BeeYield Apiary"
    return "BeeYield Apiary" if name.strip().lower() == "kibwezi main apiary" else name


async def generate_batch_id(hive_name: str, harvest_date: Optional[str] = None) -> str:
    """Uses Rust for base formatting, then checks DB for collisions."""
    base_id = _batcher.generate_id_prefix(hive_name, harvest_date)

    # Collision check remains in Python (DB bound)
    existing = await db_select("harvests", columns="batch_id", filters={"batch_id": f"like.{base_id}%"}, token=_write_token(None))
    if not existing:
        return base_id

    return f"{base_id}-{len(existing) + 1}"


async def generate_public_batch_code(harvest_date: str, token: Optional[str] = None) -> str:
    """Generate the public BEE-YYYY-MM-NNNN traceability code."""
    try:
        parsed_date = datetime.fromisoformat(harvest_date.replace("Z", "+00:00"))
    except ValueError:
        parsed_date = datetime.utcnow()

    prefix = f"BEE-{parsed_date.year:04d}-{parsed_date.month:02d}-"
    existing = await db_select(
        "honey_batches",
        columns="batch_code",
        filters={"batch_code": f"like.{prefix}%"},
        limit=2000,
        token=_write_token(token),
    )

    max_suffix = 0
    pattern = re.compile(rf"^{re.escape(prefix)}(\d{{4}})$")
    for row in existing:
        match = pattern.match(str(row.get("batch_code") or "").strip())
        if match:
            max_suffix = max(max_suffix, int(match.group(1)))

    return f"{prefix}{max_suffix + 1:04d}"


async def fetch_iot_snapshot(hive_id: str) -> Dict[str, Any]:
    """Fetch remains in Python."""
    try:
        readings = await db_select(
            "sensor_readings",
            columns="temp_internal,humidity_internal,weight_kg,recorded_at",
            filters={"hive_id": hive_id},
            order_by="recorded_at",
            ascending=False,
            limit=1,
            token=_write_token(None),
        )
        if readings:
            r = readings[0]
            return {
                "temp": r.get("temp_internal") or r.get("temperature"),
                "humidity": r.get("humidity_internal") or r.get("humidity"),
                "weight_before": r.get("weight_kg"),
                "recorded_at": r.get("recorded_at"),
                "source": "iot_sensor"
            }
    except Exception:
        pass
    return {"temp": "N/A", "humidity": "N/A", "weight_before": "N/A", "source": "unavailable"}


async def fetch_health_snapshot(hive_id: str) -> Dict[str, Any]:
    """Fetch remains in Python."""
    try:
        detections = await db_select(
            "disease_detections",
            columns="threat_type,severity,detected_at",
            filters={"hive_id": hive_id},
            order_by="detected_at",
            ascending=False,
            limit=1,
            token=_write_token(None),
        )
        if detections:
            latest = detections[0]
            return {
                "status": f"Alert: {latest['threat_type']}" if latest['severity'] == "critical" else "Clean",
                "last_inspection": latest['detected_at'],
                "certified_disease_free": latest['severity'] != "critical",
                "verification": "BeeYield AI Health Scan"
            }
    except Exception:
        pass
    return {"status": "Clean", "last_inspection": "N/A", "certified_disease_free": True, "verification": "Manual scan"}


async def log_harvest_batch(
    user_id: str,
    hive_id: str,
    apiary_id: str,
    hive_name: str,
    quantity_kg: float,
    florage_type: str,
    harvest_date: str,
    farmer_name: str = "Unknown",
    token: Optional[str] = None,
    extra_data: Optional[dict] = None
) -> Dict[str, Any]:
    """
    Orchestrates DB fetches, then uses Rust to compile the final record.
    """
    write_token = _write_token(token)

    # 1. Generate internal and public identifiers
    batch_id = await generate_batch_id(hive_name, harvest_date)
    public_batch_code = await generate_public_batch_code(harvest_date, token=write_token)

    # 2. Fetch Snapshots and context
    iot_snapshot = await fetch_iot_snapshot(hive_id)
    health_snapshot = await fetch_health_snapshot(hive_id)

    apiary_rows = await db_select("apiaries", filters={"id": apiary_id}, limit=1, token=write_token)
    apiary_row = apiary_rows[0] if apiary_rows else {}

    farmer_row: dict[str, Any] = {}
    farmer_id = (extra_data or {}).get("farmer_id") or apiary_row.get("farmer_id")
    if farmer_id:
        farmer_rows = await db_select("farmers", filters={"id": farmer_id}, limit=1, token=write_token)
        farmer_row = farmer_rows[0] if farmer_rows else {}

    merged_extra = {
        **(extra_data or {}),
        "batch_code": public_batch_code,
        "is_verified": (extra_data or {}).get("is_verified", True),
    }

    # 3. Compile harvest record in Rust
    batch_record = _batcher.compile_record(
        user_id=user_id,
        batch_id=batch_id,
        hive_id=hive_id,
        apiary_id=apiary_id,
        harvest_date=harvest_date,
        quantity_kg=quantity_kg,
        florage_type=florage_type,
        iot_snapshot=iot_snapshot,
        health_snapshot=health_snapshot,
        farmer_name=farmer_name,
        extra_data=merged_extra
    )
    qr_code_url = batch_record.get("qr_code_url")

    # 4. Persist harvest
    harvest_result = await db_insert("harvests", batch_record, token=write_token)
    if not harvest_result.get("success"):
        return {"status": "error", "error": harvest_result.get("error"), "batch_id": batch_id}

    harvest_record = harvest_result.get("data", [batch_record])[0]
    honey_batch_record = {
        "batch_code": public_batch_code,
        "harvest_date": harvest_date,
        "packaged_date": harvest_date,
        "quantity_kg": quantity_kg,
        "honey_type": merged_extra.get("honey_type") or florage_type or "BeeYield Honey",
        "processing_method": merged_extra.get("extraction_method") or "Cold Extraction",
        "farmer_name": farmer_name,
        "farmer_phone": farmer_row.get("phone"),
        "beekeeper_name": farmer_name,
        "beekeeper_id": farmer_row.get("farmer_id") or farmer_row.get("id") or user_id,
        "apiary_name": _normalize_apiary_name(apiary_row.get("name")),
        "location_county": apiary_row.get("county") or "Makueni",
        "location_region": apiary_row.get("region") or apiary_row.get("location_name") or "Kibwezi East",
        "latitude": apiary_row.get("latitude"),
        "longitude": apiary_row.get("longitude"),
        "quality_grade": "A" if health_snapshot.get("certified_disease_free", True) else "B",
        "moisture_content": merged_extra.get("moisture_content_percent"),
        "color_grade": merged_extra.get("color_grade") or "Light Amber",
        "status": "verified" if merged_extra.get("is_verified", True) else "pending",
        "user_id": user_id,
        "hive_id": hive_id,
        "apiary_id": apiary_id,
        "farmer_id": farmer_id,
        "harvest_id": harvest_record.get("id"),
    }

    batch_result = await db_insert("honey_batches", honey_batch_record, token=write_token)
    if not batch_result.get("success"):
        return {
            "status": "error",
            "error": batch_result.get("error"),
            "batch_id": batch_id,
            "record": harvest_record,
        }

    return {
        "status": "success",
        "batch_id": batch_id,
        "batch_code": public_batch_code,
        "qr_code_url": qr_code_url,
        "iot_snapshot": iot_snapshot,
        "health_snapshot": health_snapshot,
        "record": harvest_record,
        "batch_record": batch_result.get("data", [honey_batch_record])[0],
    }
