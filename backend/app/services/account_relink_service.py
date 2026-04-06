from __future__ import annotations

from typing import Any, Optional
from uuid import uuid4

from app.core.config import settings
from app.db.supabase_db import db_insert, db_select, db_update, db_upsert


DEFAULT_TIMOTHY_STORY = (
    "Timothy Nduva manages BeeYield Apiary in Kibwezi and maintains the hive, "
    "harvest, and traceability records for the operation."
)


def _service_token(token: Optional[str]) -> Optional[str]:
    return token or settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY


def _filter_update_payload(row: dict[str, Any], desired: dict[str, Any]) -> dict[str, Any]:
    allowed = set(row.keys())
    return {key: value for key, value in desired.items() if key in allowed}


async def _sample_row(table: str, token: Optional[str]) -> Optional[dict[str, Any]]:
    rows = await db_select(table, limit=1, token=token)
    return rows[0] if rows else None


async def _load_related_rows(
    *,
    table: str,
    apiary_id: str,
    hive_ids: list[str],
    token: Optional[str],
) -> list[dict[str, Any]]:
    try:
        rows = await db_select(table, filters={"apiary_id": apiary_id}, limit=5000, token=token)
        if rows:
            return rows
    except Exception:
        pass

    if hive_ids:
        try:
            return await db_select(table, filters={"hive_id": hive_ids}, limit=5000, token=token)
        except Exception:
            return []
    return []


async def ensure_profile(
    *,
    user_id: str,
    email: Optional[str],
    first_name: str,
    last_name: str,
    phone: Optional[str],
    token: Optional[str],
) -> dict[str, Any]:
    lookup_token = _service_token(token)
    existing = await db_select("profiles", filters={"id": user_id}, limit=1, token=lookup_token)
    payload = {
        "id": user_id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
    }

    if existing:
        profile = existing[0]
        safe_payload = _filter_update_payload(profile, payload)
        if safe_payload:
            await db_update("profiles", safe_payload, {"id": user_id}, token=lookup_token)
            profile.update(safe_payload)
        return profile

    result = await db_upsert("profiles", payload, on_conflict="id", token=lookup_token)
    if result.get("success") and result.get("data"):
        return result["data"][0]

    await db_upsert("profiles", {"id": user_id}, on_conflict="id", token=lookup_token)
    rows = await db_select("profiles", filters={"id": user_id}, limit=1, token=lookup_token)
    return rows[0] if rows else {"id": user_id}


async def ensure_farmer(
    *,
    user_id: str,
    email: Optional[str],
    farmer_name: str,
    phone: Optional[str],
    location_name: str,
    county: Optional[str],
    region: Optional[str],
    token: Optional[str],
) -> dict[str, Any]:
    lookup_token = _service_token(token)
    existing = await db_select("farmers", filters={"user_id": user_id}, limit=1, token=lookup_token)
    desired = {
        "user_id": user_id,
        "name": farmer_name,
        "email": email,
        "phone": phone,
        "location_name": location_name,
        "county": county,
        "region": region,
        "experience_years": 0,
        "story": DEFAULT_TIMOTHY_STORY,
    }

    if existing:
        farmer = existing[0]
        safe_payload = _filter_update_payload(farmer, desired)
        if safe_payload:
            await db_update("farmers", safe_payload, {"id": farmer["id"]}, token=lookup_token)
            farmer.update(safe_payload)
        return farmer

    insert_payload = {"id": str(uuid4()), **desired}
    result = await db_insert("farmers", insert_payload, token=lookup_token)
    if result.get("success") and result.get("data"):
        return result["data"][0]

    fallback_payload = {
        "id": str(uuid4()),
        "user_id": user_id,
        "name": farmer_name,
    }
    if email:
        fallback_payload["email"] = email
    fallback_result = await db_insert("farmers", fallback_payload, token=lookup_token)
    if fallback_result.get("success") and fallback_result.get("data"):
        return fallback_result["data"][0]

    rows = await db_select("farmers", filters={"user_id": user_id}, limit=1, token=lookup_token)
    if rows:
        return rows[0]
    raise RuntimeError(f"Unable to create or load farmer for user {user_id}")


async def _count_rows(table: str, filters: dict[str, Any], token: Optional[str]) -> int:
    rows = await db_select(table, filters=filters, limit=5000, token=token)
    return len(rows)


async def relink_beeyield_account(
    *,
    target_user_id: str,
    target_email: Optional[str],
    source_user_id: str,
    apiary_id: str,
    farmer_name: str = "Timothy Nduva",
    first_name: str = "Timothy",
    last_name: str = "Nduva",
    phone: Optional[str] = None,
    location_name: str = "Kibwezi",
    county: Optional[str] = "Makueni",
    region: Optional[str] = "Eastern",
    dry_run: bool = False,
    token: Optional[str] = None,
) -> dict[str, Any]:
    lookup_token = _service_token(token)

    apiaries = await db_select("apiaries", filters={"id": apiary_id}, limit=1, token=lookup_token)
    if not apiaries:
        raise RuntimeError(f"Apiary {apiary_id} was not found")

    apiary = apiaries[0]
    profile = await ensure_profile(
        user_id=target_user_id,
        email=target_email,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        token=lookup_token,
    )
    farmer = await ensure_farmer(
        user_id=target_user_id,
        email=target_email,
        farmer_name=farmer_name,
        phone=phone,
        location_name=apiary.get("location_name") or location_name,
        county=apiary.get("county") or county,
        region=apiary.get("region") or region,
        token=lookup_token,
    )
    farmer_id = str(farmer["id"])

    hives = await db_select("hives", filters={"apiary_id": apiary_id}, limit=5000, token=lookup_token)
    hive_ids = [str(row["id"]) for row in hives if row.get("id")]
    harvests = await db_select("harvests", filters={"apiary_id": apiary_id}, limit=5000, token=lookup_token)
    sensor_rows = await _load_related_rows(
        table="sensor_readings",
        apiary_id=apiary_id,
        hive_ids=hive_ids,
        token=lookup_token,
    )
    disease_rows = await _load_related_rows(
        table="disease_detections",
        apiary_id=apiary_id,
        hive_ids=hive_ids,
        token=lookup_token,
    )
    devices = await db_select("iot_devices", filters={"apiary_id": apiary_id}, limit=5000, token=lookup_token)
    batch_rows = await db_select(
        "honey_batches",
        filters={"farmer_name": farmer_name, "apiary_name": apiary.get("name")},
        limit=5000,
        token=lookup_token,
    )

    hive_count = len(hives)
    harvest_total_kg = round(
        sum(float(row.get("weight_kg") or row.get("quantity_kg") or 0) for row in harvests),
        2,
    )

    counts = {
        "profiles": 1 if profile else 0,
        "farmers": 1 if farmer else 0,
        "apiaries": 1,
        "hives": hive_count,
        "harvests": len(harvests),
        "sensor_readings": len(sensor_rows),
        "disease_detections": len(disease_rows),
        "iot_devices": len(devices),
        "honey_batches": len(batch_rows),
    }

    if dry_run:
        return {
            "status": "dry_run",
            "target_user_id": target_user_id,
            "source_user_id": source_user_id,
            "apiary_id": apiary_id,
            "farmer_id": farmer_id,
            "counts": counts,
            "harvest_total_kg": harvest_total_kg,
        }

    apiary_payload = _filter_update_payload(
        apiary,
        {
            "user_id": target_user_id,
            "farmer_id": farmer_id,
            "hive_count": hive_count,
            "expected_hives": hive_count,
        },
    )
    if apiary_payload:
        await db_update("apiaries", apiary_payload, {"id": apiary_id}, token=lookup_token)

    sample_hive = hives[0] if hives else await _sample_row("hives", lookup_token)
    hive_payload = _filter_update_payload(
        sample_hive or {},
        {
            "user_id": target_user_id,
            "farmer_id": farmer_id,
        },
    )
    if hive_payload and hives:
        await db_update("hives", hive_payload, {"apiary_id": apiary_id}, token=lookup_token)

    sample_harvest = harvests[0] if harvests else await _sample_row("harvests", lookup_token)
    harvest_payload = _filter_update_payload(
        sample_harvest or {},
        {
            "user_id": target_user_id,
            "farmer_id": farmer_id,
        },
    )
    if harvest_payload and harvests:
        await db_update("harvests", harvest_payload, {"apiary_id": apiary_id}, token=lookup_token)

    sample_sensor = sensor_rows[0] if sensor_rows else await _sample_row("sensor_readings", lookup_token)
    sensor_payload = _filter_update_payload(
        sample_sensor or {},
        {
            "user_id": target_user_id,
            "farmer_id": farmer_id,
        },
    )
    if sensor_payload and sensor_rows:
        if sensor_rows[0].get("apiary_id"):
            await db_update("sensor_readings", sensor_payload, {"apiary_id": apiary_id}, token=lookup_token)
        elif sensor_rows[0].get("hive_id"):
            for hive_id in hive_ids:
                await db_update("sensor_readings", sensor_payload, {"hive_id": hive_id}, token=lookup_token)

    sample_disease = disease_rows[0] if disease_rows else await _sample_row("disease_detections", lookup_token)
    disease_payload = _filter_update_payload(
        sample_disease or {},
        {
            "user_id": target_user_id,
            "farmer_id": farmer_id,
        },
    )
    if disease_payload and disease_rows:
        if disease_rows[0].get("apiary_id"):
            await db_update("disease_detections", disease_payload, {"apiary_id": apiary_id}, token=lookup_token)
        elif disease_rows[0].get("hive_id"):
            for hive_id in hive_ids:
                await db_update("disease_detections", disease_payload, {"hive_id": hive_id}, token=lookup_token)

    sample_device = devices[0] if devices else await _sample_row("iot_devices", lookup_token)
    device_payload = _filter_update_payload(
        sample_device or {},
        {
            "user_id": target_user_id,
            "farmer_id": farmer_id,
        },
    )
    if device_payload and devices:
        await db_update("iot_devices", device_payload, {"apiary_id": apiary_id}, token=lookup_token)

    sample_batch = batch_rows[0] if batch_rows else await _sample_row("honey_batches", lookup_token)
    batch_payload = _filter_update_payload(
        sample_batch or {},
        {
            "user_id": target_user_id,
            "farmer_id": farmer_id,
            "farmer_name": farmer_name,
            "apiary_name": apiary.get("name"),
        },
    )
    if batch_payload and batch_rows:
        await db_update(
            "honey_batches",
            batch_payload,
            {"farmer_name": farmer_name, "apiary_name": apiary.get("name")},
            token=lookup_token,
        )

    updated_counts = {
        "apiaries_for_timothy": await _count_rows("apiaries", {"user_id": target_user_id}, lookup_token),
        "hives_for_timothy": await _count_rows("hives", {"user_id": target_user_id}, lookup_token),
        "harvests_for_timothy": await _count_rows("harvests", {"user_id": target_user_id}, lookup_token),
    }
    if batch_payload:
        updated_counts["batches_for_timothy"] = len(
            await db_select(
                "honey_batches",
                filters={"farmer_name": farmer_name, "apiary_name": apiary.get("name")},
                limit=5000,
                token=lookup_token,
            )
        )

    return {
        "status": "success",
        "target_user_id": target_user_id,
        "source_user_id": source_user_id,
        "apiary_id": apiary_id,
        "profile_id": target_user_id,
        "farmer_id": farmer_id,
        "counts": counts,
        "updated_counts": updated_counts,
        "harvest_total_kg": harvest_total_kg,
    }
