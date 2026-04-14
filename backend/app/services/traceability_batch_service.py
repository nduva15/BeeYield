from __future__ import annotations

import re
from typing import Any, Optional

from app.core.config import settings
from app.db.supabase_db import db_select


def _has_value(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return value.strip() != ""
    if isinstance(value, (list, tuple, dict, set)):
        return len(value) > 0
    return True


def _normalize_harvest(harvest: Optional[dict[str, Any]]) -> dict[str, Any]:
    if not harvest:
        return {}

    normalized = dict(harvest)

    if "harvest_date" not in normalized and normalized.get("date"):
        normalized["harvest_date"] = normalized["date"]
    if "quantity_kg" not in normalized and normalized.get("weight_kg") is not None:
        normalized["quantity_kg"] = normalized["weight_kg"]
    if "nectar_source" not in normalized and normalized.get("floral_source"):
        normalized["nectar_source"] = normalized["floral_source"]
    if normalized.get("moisture_content") is not None and normalized.get("moisture_content_percent") is None:
        normalized["moisture_content_percent"] = normalized["moisture_content"]
    if normalized.get("hive") and normalized["hive"].get("apiary") and not normalized.get("apiary"):
        normalized["apiary"] = normalized["hive"]["apiary"]

    return normalized


def _resolve_field(*candidates: Any) -> tuple[Any, str]:
    for index, candidate in enumerate(candidates):
        if _has_value(candidate):
            return candidate, "present" if index == 0 else "derivable"
    return None, "missing"


def _lookup_token(token: Optional[str]) -> Optional[str]:
    return getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", None) or token


def _normalize_apiary_name(name: Any) -> Any:
    if not isinstance(name, str):
        return name
    return "BeeYield Apiary" if name.strip().lower() == "kibwezi main apiary" else name


def _normalize_bee_code(code: Any) -> Any:
    if not isinstance(code, str):
        return code

    normalized = code.strip()
    if normalized.startswith("BY-H"):
        return re.sub(r"^BY-H", "BEE-H", normalized)
    if normalized.startswith("BY-"):
        return re.sub(r"^BY-", "BEE-", normalized)
    if normalized.startswith("KBZ-"):
        return re.sub(r"^KBZ-", "BEE-", normalized)
    if normalized.startswith("KIB-"):
        return re.sub(r"^KIB-", "BEE-", normalized)
    return normalized


def _candidate_batch_codes(batch_code: str) -> list[str]:
    raw = batch_code.strip()
    if not raw:
        return []

    variants = [
        raw,
        re.sub(r"^BEE-", "BY-", raw),
        re.sub(r"^BEE-", "KBZ-", raw),
        re.sub(r"^BEE-", "KIB-", raw),
        re.sub(r"^BY-", "BEE-", raw),
        re.sub(r"^KBZ-", "BEE-", raw),
        re.sub(r"^KIB-", "BEE-", raw),
    ]

    deduped: list[str] = []
    for value in variants:
        if value and value not in deduped:
            deduped.append(value)
    return deduped


async def _fetch_latest_sensor_snapshot(hive_id: Optional[str], token: Optional[str]) -> Optional[dict[str, Any]]:
    if not hive_id:
        return None

    readings = await db_select(
        "sensor_readings",
        columns="temp_internal,humidity_internal,weight_kg,recorded_at,temperature,humidity,latitude,longitude",
        filters={"hive_id": hive_id},
        order_by="recorded_at",
        ascending=False,
        limit=1,
        token=_lookup_token(token),
    )
    if not readings:
        return None

    latest = readings[0]
    temp = latest.get("temp_internal")
    humidity = latest.get("humidity_internal")

    return {
        "avg_temp": temp if temp is not None else latest.get("temperature"),
        "avg_humidity": humidity if humidity is not None else latest.get("humidity"),
        "weight_kg": latest.get("weight_kg"),
        "sync_time": latest.get("recorded_at"),
        "latitude": latest.get("latitude"),
        "longitude": latest.get("longitude"),
        "source": "sensor_readings",
    }


async def _fetch_latest_health_snapshot(hive_id: Optional[str], token: Optional[str]) -> Optional[dict[str, Any]]:
    if not hive_id:
        return None

    detections = await db_select(
        "disease_detections",
        columns="threat_type,severity,detected_at",
        filters={"hive_id": hive_id},
        order_by="detected_at",
        ascending=False,
        limit=1,
        token=_lookup_token(token),
    )
    if not detections:
        return None

    latest = detections[0]
    severity = latest.get("severity")
    return {
        "status": "Alert" if severity == "critical" else "Clean",
        "last_inspection": latest.get("detected_at"),
        "certified_disease_free": severity != "critical",
        "verification": "BeeYield AI Health Scan",
        "threat_type": latest.get("threat_type"),
        "severity": severity,
        "source": "disease_detections",
    }


def _build_blockchain_status(batch_code: Optional[str], batch_row: dict[str, Any], harvest_row: dict[str, Any]) -> dict[str, Any]:
    if not batch_code:
        return {
            "overall": "unverified",
            "honeychain": {"verified": False},
            "polygon": {"verified": False},
        }

    honeychain_status: dict[str, Any] = {"verified": False}
    polygon_status: dict[str, Any] = {"verified": False}

    try:
        from app.blockchain.honey_chain import honey_blockchain

        chain_trace = honey_blockchain.trace_batch(batch_code)
        if chain_trace.get("found"):
            honeychain_status = {
                "verified": True,
                "block_hash": chain_trace.get("block_hash"),
                "verification_url": chain_trace.get("verification_url"),
                "chain_stats": chain_trace.get("chain_stats", {}),
            }
    except Exception as exc:
        honeychain_status = {"verified": False, "error": str(exc)}

    try:
        from app.services.polygon_service import polygon_service

        polygon_result = polygon_service.verify_batch_on_chain(batch_code)
        polygon_status = {
            "verified": bool(polygon_result.get("verified")),
            "status": polygon_result.get("status"),
            "tx_hash": polygon_result.get("tx_hash"),
            "verification_url": polygon_result.get("verification_url"),
            "network": polygon_result.get("network"),
            "on_chain_verified": polygon_result.get("on_chain_verified"),
        }
    except Exception as exc:
        polygon_status = {"verified": False, "error": str(exc)}

    overall = "unverified"
    if honeychain_status.get("verified") and polygon_status.get("verified"):
        overall = "verified"
    elif honeychain_status.get("verified") or polygon_status.get("verified"):
        overall = "partial"

    return {
        "overall": overall,
        "honeychain": honeychain_status,
        "polygon": polygon_status,
        "block_hash": batch_row.get("block_hash") or honeychain_status.get("block_hash") or harvest_row.get("blockchain_hash"),
    }


def _build_completeness(
    batch_row: dict[str, Any],
    harvest_row: dict[str, Any],
    farmer: dict[str, Any],
    apiary: dict[str, Any],
    hive: dict[str, Any],
    sensor_snapshot: Optional[dict[str, Any]],
    health_snapshot: Optional[dict[str, Any]],
    blockchain_status: dict[str, Any],
) -> dict[str, Any]:
    field_statuses: dict[str, dict[str, str]] = {
        "core": {},
        "origin": {},
        "quality": {},
        "telemetry": {},
        "verification": {},
    }

    def add(section: str, field: str, *candidates: Any) -> Any:
        value, status = _resolve_field(*candidates)
        field_statuses[section][field] = status
        return value

    add("core", "batch_code", batch_row.get("batch_code"), harvest_row.get("batch_code"))
    add("core", "honey_type", batch_row.get("honey_type"), harvest_row.get("honey_type"))
    add("core", "harvest_date", batch_row.get("harvest_date"), harvest_row.get("harvest_date"))
    add("core", "quantity_kg", batch_row.get("quantity_kg"), harvest_row.get("quantity_kg"))
    add("core", "status", batch_row.get("status"))

    add("origin", "farmer_name", batch_row.get("farmer_name"), farmer.get("name"))
    add("origin", "apiary_name", batch_row.get("apiary_name"), apiary.get("name"))
    add("origin", "location_county", batch_row.get("location_county"), apiary.get("county"), farmer.get("county"))
    add("origin", "location_region", batch_row.get("location_region"), apiary.get("region"), farmer.get("region"))
    add("origin", "hive_code", hive.get("hive_code"))
    add("origin", "florage_type", harvest_row.get("florage_type"), harvest_row.get("nectar_source"))

    add("quality", "processing_method", batch_row.get("processing_method"), harvest_row.get("extraction_method"))
    add("quality", "quality_grade", batch_row.get("quality_grade"))
    add("quality", "moisture_content", batch_row.get("moisture_content"), harvest_row.get("moisture_content_percent"))
    add("quality", "color_grade", batch_row.get("color_grade"), harvest_row.get("color_grade"))
    add("quality", "quantity_left_for_bees_kg", harvest_row.get("quantity_left_for_bees_kg"))

    add("telemetry", "sensor_snapshot", sensor_snapshot)
    add("telemetry", "health_snapshot", health_snapshot)

    add("verification", "honeychain", blockchain_status.get("honeychain", {}).get("verified"))
    add("verification", "polygon", blockchain_status.get("polygon", {}).get("verified"))
    add("verification", "block_hash", blockchain_status.get("block_hash"))

    present = derivable = missing = 0
    section_summaries: dict[str, Any] = {}

    for section, statuses in field_statuses.items():
        values = list(statuses.values())
        present_count = values.count("present")
        derivable_count = values.count("derivable")
        missing_count = values.count("missing")
        present += present_count
        derivable += derivable_count
        missing += missing_count

        if missing_count == 0:
            section_status = "complete"
        elif present_count == 0 and derivable_count == 0:
            section_status = "missing"
        else:
            section_status = "partial"

        section_summaries[section] = {
            "status": section_status,
            "present": present_count,
            "derivable": derivable_count,
            "missing": missing_count,
            "fields": statuses,
        }

    overall = "complete"
    if missing > 0:
        overall = "partial" if present + derivable > 0 else "missing"

    return {
        "status": overall,
        "present": present,
        "derivable": derivable,
        "missing": missing,
        "sections": section_summaries,
    }


async def build_batch_view(
    batch_row: Optional[dict[str, Any]],
    harvest_row: Optional[dict[str, Any]],
    token: Optional[str] = None,
    include_live_snapshots: bool = False,
) -> dict[str, Any]:
    batch = batch_row or {}
    harvest = _normalize_harvest(harvest_row)
    hive = harvest.get("hive") or {}
    apiary = harvest.get("apiary") or {}
    farmer = harvest.get("farmer") or {}

    batch_code, _ = _resolve_field(batch.get("batch_code"), harvest.get("batch_code"))
    honey_type, _ = _resolve_field(batch.get("honey_type"), harvest.get("honey_type"))
    harvest_date, _ = _resolve_field(batch.get("harvest_date"), harvest.get("harvest_date"))
    quantity_kg, _ = _resolve_field(batch.get("quantity_kg"), harvest.get("quantity_kg"))
    processing_method, _ = _resolve_field(batch.get("processing_method"), harvest.get("extraction_method"))
    farmer_name, _ = _resolve_field(batch.get("farmer_name"), farmer.get("name"))
    farmer_phone, _ = _resolve_field(batch.get("farmer_phone"), farmer.get("phone"))
    apiary_name, _ = _resolve_field(batch.get("apiary_name"), apiary.get("name"))
    location_county, _ = _resolve_field(batch.get("location_county"), apiary.get("county"), farmer.get("county"))
    location_region, _ = _resolve_field(batch.get("location_region"), apiary.get("region"), farmer.get("region"))
    latitude, _ = _resolve_field(batch.get("latitude"), apiary.get("latitude"), farmer.get("latitude"))
    longitude, _ = _resolve_field(batch.get("longitude"), apiary.get("longitude"), farmer.get("longitude"))
    quality_grade, _ = _resolve_field(batch.get("quality_grade"))
    moisture_content, _ = _resolve_field(batch.get("moisture_content"), harvest.get("moisture_content_percent"))
    color_grade, _ = _resolve_field(batch.get("color_grade"), harvest.get("color_grade"))
    batch_status, _ = _resolve_field(batch.get("status"))
    normalized_hive = dict(hive) if hive else {}
    normalized_apiary = dict(apiary) if apiary else {}

    normalized_batch_code = _normalize_bee_code(batch_code)
    normalized_apiary_name = _normalize_apiary_name(apiary_name)
    if normalized_hive.get("hive_code"):
        normalized_hive["hive_code"] = _normalize_bee_code(normalized_hive.get("hive_code"))
    if normalized_apiary:
        normalized_apiary["name"] = _normalize_apiary_name(normalized_apiary.get("name"))
        if normalized_apiary.get("apiary_code"):
            normalized_apiary["apiary_code"] = _normalize_bee_code(normalized_apiary.get("apiary_code"))

    sensor_snapshot = harvest.get("sensor_snapshot") or harvest.get("iot_snapshot")
    health_snapshot = harvest.get("health_snapshot")

    if include_live_snapshots:
        if not _has_value(sensor_snapshot):
            sensor_snapshot = await _fetch_latest_sensor_snapshot(harvest.get("hive_id"), token)
        if not _has_value(health_snapshot):
            health_snapshot = await _fetch_latest_health_snapshot(harvest.get("hive_id"), token)

    blockchain_status = _build_blockchain_status(batch_code, batch, harvest)
    completeness = _build_completeness(batch, harvest, farmer, apiary, hive, sensor_snapshot, health_snapshot, blockchain_status)

    quantity_left = harvest.get("quantity_left_for_bees_kg")
    sustainability_ratio = None
    sustainability_status = "missing"
    if _has_value(quantity_left) and _has_value(quantity_kg) and (quantity_left + quantity_kg) > 0:
        sustainability_ratio = round(quantity_left / (quantity_left + quantity_kg), 4)
        sustainability_status = "pass" if sustainability_ratio >= 0.5 else "fail"

    verification_status = blockchain_status.get("overall", "unverified")
    verified = verification_status != "unverified"

    return {
        "id": batch.get("id") or harvest.get("id") or normalized_batch_code,
        "batch_code": normalized_batch_code,
        "honey_type": honey_type,
        "harvest_date": harvest_date,
        "quantity_kg": quantity_kg,
        "processing_method": processing_method,
        "farmer_name": farmer_name,
        "farmer_phone": farmer_phone,
        "beekeeper_name": batch.get("beekeeper_name") or farmer_name,
        "beekeeper_id": batch.get("beekeeper_id") or farmer.get("farmer_id") or farmer.get("id"),
        "apiary_name": normalized_apiary_name,
        "location_county": location_county,
        "location_region": location_region,
        "latitude": latitude,
        "longitude": longitude,
        "quality_grade": quality_grade,
        "moisture_content": moisture_content,
        "color_grade": color_grade,
        "status": batch_status or "incomplete",
        "block_hash": blockchain_status.get("block_hash"),
        "blockchain_verified": verified,
        "verification_status": verification_status,
        "blockchain_status": blockchain_status,
        "verification_url": blockchain_status.get("polygon", {}).get("verification_url")
        or blockchain_status.get("honeychain", {}).get("verification_url")
        or "",
        "completeness": completeness,
        "harvest": harvest or None,
        "hive": normalized_hive or None,
        "apiary": normalized_apiary or None,
        "farmer": farmer or None,
        "sensor_snapshot": sensor_snapshot,
        "health_snapshot": health_snapshot,
        "florage_type": harvest.get("florage_type"),
        "extra_metadata": harvest.get("extra_metadata") or {},
        "quantity_left_for_bees_kg": quantity_left,
        "sustainability": {
            "rule": "50_percent_left_for_bees",
            "ratio": sustainability_ratio,
            "status": sustainability_status,
        },
    }


async def get_batch_view_by_code(
    batch_code: str,
    token: Optional[str] = None,
    include_live_snapshots: bool = True,
) -> Optional[dict[str, Any]]:
    lookup_token = _lookup_token(token)
    candidate_codes = _candidate_batch_codes(batch_code)
    code_filter: str | list[str] = candidate_codes if len(candidate_codes) > 1 else (candidate_codes[0] if candidate_codes else batch_code)
    batch_rows = await db_select("honey_batches", filters={"batch_code": code_filter}, limit=1, token=lookup_token)
    harvest_rows = await db_select(
        "harvests",
        columns="*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)",
        filters={"batch_code": code_filter},
        limit=1,
        token=lookup_token,
    )

    batch_row = batch_rows[0] if batch_rows else None
    harvest_row = harvest_rows[0] if harvest_rows else None

    if not batch_row and not harvest_row:
        return None

    return await build_batch_view(batch_row, harvest_row, token=lookup_token, include_live_snapshots=include_live_snapshots)


async def _get_user_scope(user_id: str, token: Optional[str]) -> dict[str, Any]:
    lookup_token = _lookup_token(token)
    profiles = await db_select("profiles", filters={"id": user_id}, limit=1, token=lookup_token)
    farmers = await db_select("farmers", filters={"user_id": user_id}, limit=50, token=lookup_token)

    farmer_ids = [row["id"] for row in farmers if row.get("id")]

    apiaries = await db_select("apiaries", filters={"user_id": [user_id]}, limit=1000, token=lookup_token)
    if farmer_ids:
        farmer_apiaries = await db_select("apiaries", filters={"farmer_id": farmer_ids}, limit=1000, token=lookup_token)
        apiary_map = {row["id"]: row for row in apiaries + farmer_apiaries if row.get("id")}
        apiaries = list(apiary_map.values())

    shares = await db_select("apiary_shares", filters={"shared_with_user_id": user_id}, limit=1000, token=lookup_token)
    shared_apiary_ids = [row["apiary_id"] for row in shares if row.get("apiary_id")]
    if shared_apiary_ids:
        shared_apiaries = await db_select("apiaries", filters={"id": shared_apiary_ids}, limit=1000, token=lookup_token)
        apiary_map = {row["id"]: row for row in apiaries + shared_apiaries if row.get("id")}
        apiaries = list(apiary_map.values())

    apiary_ids = [row["id"] for row in apiaries if row.get("id")]

    return {
        "profile": profiles[0] if profiles else None,
        "farmers": farmers,
        "farmer_ids": farmer_ids,
        "apiaries": apiaries,
        "apiary_ids": apiary_ids,
    }


async def get_batch_views_for_user(
    user_id: str,
    token: Optional[str] = None,
    honey_type: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = 1000,
) -> list[dict[str, Any]]:
    scope = await _get_user_scope(user_id, token)
    lookup_token = _lookup_token(token)

    columns = "*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)"
    harvest_rows: list[dict[str, Any]] = []

    if scope["apiary_ids"]:
        harvest_rows.extend(
            await db_select("harvests", columns=columns, filters={"apiary_id": scope["apiary_ids"]}, limit=2000, token=lookup_token)
        )
    else:
        harvest_rows.extend(
            await db_select("harvests", columns=columns, filters={"user_id": [user_id]}, limit=2000, token=lookup_token)
        )
        if scope["farmer_ids"]:
            harvest_rows.extend(
                await db_select("harvests", columns=columns, filters={"farmer_id": scope["farmer_ids"]}, limit=2000, token=lookup_token)
            )

    deduped_harvests: dict[str, dict[str, Any]] = {}
    for row in harvest_rows:
        deduped_harvests[str(row.get("id") or row.get("batch_code") or len(deduped_harvests))] = row

    normalized_harvests = [_normalize_harvest(row) for row in deduped_harvests.values()]
    batch_codes = [row.get("batch_code") for row in normalized_harvests if row.get("batch_code")]
    batch_rows = await db_select("honey_batches", filters={"batch_code": batch_codes}, limit=max(limit, len(batch_codes) or 1), token=lookup_token) if batch_codes else []

    harvest_by_code = {row.get("batch_code"): row for row in normalized_harvests if row.get("batch_code")}
    batch_by_code = {row.get("batch_code"): row for row in batch_rows if row.get("batch_code")}
    ordered_codes: list[str] = []

    for row in normalized_harvests:
        code = row.get("batch_code")
        if code and code not in ordered_codes:
            ordered_codes.append(code)
    for row in batch_rows:
        code = row.get("batch_code")
        if code and code not in ordered_codes:
            ordered_codes.append(code)

    views: list[dict[str, Any]] = []
    for code in ordered_codes:
        view = await build_batch_view(batch_by_code.get(code), harvest_by_code.get(code), token=lookup_token, include_live_snapshots=False)
        if honey_type and view.get("honey_type") != honey_type:
            continue
        if year and str(view.get("harvest_date") or "")[:4] != str(year):
            continue
        views.append(view)

    views.sort(key=lambda row: row.get("harvest_date") or "", reverse=True)
    return views[:limit]


async def get_all_batch_views(
    token: Optional[str] = None,
    honey_type: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = 1000,
) -> list[dict[str, Any]]:
    lookup_token = _lookup_token(token)
    harvest_rows = await db_select(
        "harvests",
        columns="*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)",
        limit=max(limit, 2000),
        order_by="date",
        ascending=False,
        token=lookup_token,
    )
    batch_rows = await db_select(
        "honey_batches",
        limit=max(limit, 2000),
        order_by="harvest_date",
        ascending=False,
        token=lookup_token,
    )

    normalized_harvests = [_normalize_harvest(row) for row in harvest_rows]
    harvest_by_code = {row.get("batch_code"): row for row in normalized_harvests if row.get("batch_code")}
    batch_by_code = {row.get("batch_code"): row for row in batch_rows if row.get("batch_code")}

    ordered_codes: list[str] = []
    for row in batch_rows:
        code = row.get("batch_code")
        if code and code not in ordered_codes:
            ordered_codes.append(code)
    for row in normalized_harvests:
        code = row.get("batch_code")
        if code and code not in ordered_codes:
            ordered_codes.append(code)

    views: list[dict[str, Any]] = []
    for code in ordered_codes:
        view = await build_batch_view(batch_by_code.get(code), harvest_by_code.get(code), token=lookup_token, include_live_snapshots=False)
        if honey_type and view.get("honey_type") != honey_type:
            continue
        if year and str(view.get("harvest_date") or "")[:4] != str(year):
            continue
        views.append(view)

    views.sort(key=lambda row: row.get("harvest_date") or "", reverse=True)
    return views[:limit]


async def audit_account_traceability(
    email: Optional[str] = None,
    user_id: Optional[str] = None,
    token: Optional[str] = None,
) -> dict[str, Any]:
    lookup_token = _lookup_token(token)

    profile = None
    if email:
        profiles = await db_select("profiles", filters={"email": email}, limit=1, token=lookup_token)
        profile = profiles[0] if profiles else None
    elif user_id:
        profiles = await db_select("profiles", filters={"id": user_id}, limit=1, token=lookup_token)
        profile = profiles[0] if profiles else None

    resolved_user_id = user_id or (profile or {}).get("id")
    scope = await _get_user_scope(resolved_user_id, lookup_token) if resolved_user_id else {
        "profile": profile,
        "farmers": [],
        "farmer_ids": [],
        "apiaries": [],
        "apiary_ids": [],
    }

    profile = scope.get("profile") or profile
    apiary_ids = scope.get("apiary_ids", [])
    farmer_ids = scope.get("farmer_ids", [])

    hives = await db_select("hives", filters={"apiary_id": apiary_ids}, limit=5000, token=lookup_token) if apiary_ids else []
    hive_ids = [row["id"] for row in hives if row.get("id")]

    harvests: list[dict[str, Any]] = []
    if resolved_user_id:
        harvests.extend(await db_select("harvests", filters={"user_id": [resolved_user_id]}, limit=5000, token=lookup_token))
    if farmer_ids:
        harvests.extend(await db_select("harvests", filters={"farmer_id": farmer_ids}, limit=5000, token=lookup_token))
    if apiary_ids:
        harvests.extend(await db_select("harvests", filters={"apiary_id": apiary_ids}, limit=5000, token=lookup_token))

    deduped_harvests = {str(row.get("id") or len(harvests)): row for row in harvests}
    batch_codes = list({row.get("batch_code") for row in deduped_harvests.values() if row.get("batch_code")})

    batch_rows = await db_select("honey_batches", filters={"batch_code": batch_codes}, limit=max(len(batch_codes), 1), token=lookup_token) if batch_codes else []
    sensor_rows = await db_select("sensor_readings", filters={"hive_id": hive_ids}, limit=5000, token=lookup_token) if hive_ids else []
    health_rows = await db_select("disease_detections", filters={"hive_id": hive_ids}, limit=5000, token=lookup_token) if hive_ids else []
    variant_rows = await db_select("product_variants", filters={"batch_code": batch_codes}, limit=5000, token=lookup_token) if batch_codes else []
    history_rows = await db_select("tracing_history", filters={"batch_code": batch_codes}, limit=5000, token=lookup_token) if batch_codes else []

    counts = {
        "profiles": 1 if profile else 0,
        "farmers": len(scope.get("farmers", [])),
        "apiaries": len(scope.get("apiaries", [])),
        "hives": len(hives),
        "harvests": len(deduped_harvests),
        "honey_batches": len(batch_rows),
        "sensor_readings": len(sensor_rows),
        "disease_detections": len(health_rows),
        "product_variants": len(variant_rows),
        "tracing_history": len(history_rows),
    }

    field_checks = {
        "profile": "present" if profile else "missing",
        "farmer_link": "present" if counts["farmers"] > 0 else "missing",
        "apiary_link": "present" if counts["apiaries"] > 0 else "missing",
        "hive_link": "present" if counts["hives"] > 0 else "missing",
        "harvest_link": "present" if counts["harvests"] > 0 else "missing",
        "batch_link": "present" if counts["honey_batches"] > 0 else "missing",
        "telemetry": "present" if counts["sensor_readings"] > 0 else "missing",
        "health": "present" if counts["disease_detections"] > 0 else "missing",
        "shop_variants": "present" if counts["product_variants"] > 0 else "missing",
        "trace_history": "present" if counts["tracing_history"] > 0 else "missing",
    }

    missing = sum(1 for value in field_checks.values() if value == "missing")
    status = "complete" if missing == 0 else ("partial" if missing < len(field_checks) else "missing")

    return {
        "status": status,
        "input": {"email": email, "user_id": user_id},
        "account": {
            "resolved_user_id": resolved_user_id,
            "profile": profile,
            "farmers": scope.get("farmers", []),
            "apiaries": scope.get("apiaries", []),
        },
        "counts": counts,
        "completeness": {
            "status": status,
            "missing": missing,
            "fields": field_checks,
        },
        "batch_codes": batch_codes,
    }
