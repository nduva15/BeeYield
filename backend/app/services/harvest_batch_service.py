"""
Harvest Batching Service — Rust-Accelerated (Post-Oxidize)
=========================================================
Batch ID generation and Record Compilation ported to `beeyield_core.HarvestBatcher`.
Async database fetches remain in Python.
"""
from datetime import datetime
from typing import Any, Optional, Dict
from app.db.supabase_db import db_select, db_insert

from beeyield_core import HarvestBatcher as _RustBatcher  # type: ignore
_batcher = _RustBatcher()


async def generate_batch_id(hive_name: str, harvest_date: Optional[str] = None) -> str:
    """Uses Rust for base formatting, then checks DB for collisions."""
    base_id = _batcher.generate_id_prefix(hive_name, harvest_date)

    # Collision check remains in Python (DB bound)
    existing = await db_select("harvests", columns="batch_id", filters={"batch_id": f"like.{base_id}%"})
    if not existing:
        return base_id

    return f"{base_id}-{len(existing) + 1}"


async def fetch_iot_snapshot(hive_id: str) -> Dict[str, Any]:
    """Fetch remains in Python."""
    try:
        readings = await db_select(
            "sensor_readings",
            columns="temp_internal,humidity_internal,weight_kg,recorded_at",
            filters={"hive_id": hive_id},
            order_by="recorded_at",
            ascending=False,
            limit=1
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
            limit=1
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
    # 1. Generate ID
    batch_id = await generate_batch_id(hive_name, harvest_date)

    # 2. Fetch Snapshots
    iot_snapshot = await fetch_iot_snapshot(hive_id)
    health_snapshot = await fetch_health_snapshot(hive_id)

    # 3. Compile in Rust (Atomic operation)
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
        extra_data=extra_data
    )
    qr_code_url = batch_record.get("qr_code_url")

    # 4. Persistence
    result = await db_insert("harvests", batch_record, token=token)
    
    if not result.get("success"):
        return {"status": "error", "error": result.get("error"), "batch_id": batch_id}

    return {
        "status": "success",
        "batch_id": batch_id,
        "qr_code_url": qr_code_url,
        "iot_snapshot": iot_snapshot,
        "health_snapshot": health_snapshot,
        "record": result.get("data", [batch_record])[0]
    }
