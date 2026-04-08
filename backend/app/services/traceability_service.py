"""
Traceability service backed by canonical normalized batch views.
"""
from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, Optional

from app.db.supabase_db import db_get_by_id, db_insert, db_rpc, db_select, db_upsert
from app.schemas import traceability as schemas
from app.services.traceability_batch_service import (
    audit_account_traceability,
    build_batch_view,
    get_all_batch_views,
    get_batch_view_by_code,
)

from beeyield_core import TraceabilityEngine as _RustEngine  # type: ignore

_engine = _RustEngine()
_STATS_CACHE: dict[str, dict[str, Any]] = {}


def _as_dict(payload: Any) -> dict[str, Any]:
    if hasattr(payload, "dict"):
        return payload.dict(exclude_unset=True)
    return dict(payload)


async def _calc_season_total_from_db(batch_code: str, harvest: dict[str, Any], token: Optional[str] = None) -> str:
    cache_key = f"season:{batch_code}:{harvest.get('harvest_date')}"
    cached = _STATS_CACHE.get(cache_key)
    if cached:
        return cached["value"]

    harvest_date = str(harvest.get("harvest_date") or "")
    season_year = harvest_date[:4] if len(harvest_date) >= 4 else str(datetime.now(UTC).year)

    rpc_total = await db_rpc("get_season_total", {"season_year": season_year}, token=token)
    if rpc_total is not None:
        value = str(rpc_total)
        _STATS_CACHE[cache_key] = {"value": value}
        return value

    rows = await db_select("harvests", token=token)
    total = 0.0
    for row in rows:
        row_date = str(row.get("harvest_date") or "")
        if row_date.startswith(season_year):
            total += float(row.get("quantity_kg") or 0)

    value = str(total)
    _STATS_CACHE[cache_key] = {"value": value}
    return value


async def _calc_all_time_total_from_db(token: Optional[str] = None) -> str:
    cache_key = "all_time_total"
    cached = _STATS_CACHE.get(cache_key)
    if cached:
        return cached["value"]

    rpc_total = await db_rpc("get_all_time_total", {}, token=token)
    if rpc_total is not None:
        value = str(rpc_total)
        _STATS_CACHE[cache_key] = {"value": value}
        return value

    rows = await db_select("harvests", token=token)
    total = sum(float(row.get("quantity_kg") or 0) for row in rows)
    value = str(total)
    _STATS_CACHE[cache_key] = {"value": value}
    return value


async def _get_impact_stats_from_db(token: Optional[str]) -> dict[str, Any]:
    stats = await db_select("company_stats", token=token)
    if stats:
        return {row["stat_key"]: row["stat_value"] for row in stats if row.get("stat_key")}

    return {
        "total_honey_kg": await _calc_all_time_total_from_db(token=token),
        "hive_count": "0",
        "beekeepers": "0",
        "farmers_served": "0",
        "acres_pollinated": "0",
    }


async def _get_impact_stats(token: Optional[str]) -> dict[str, Any]:
    return await _get_impact_stats_from_db(token)


class TraceabilityService:
    @staticmethod
    async def _build_trace_response(view: dict[str, Any], token: Optional[str] = None) -> schemas.TraceResponse:
        harvest = view.get("harvest") or {}
        apiary = view.get("apiary") or {}
        timeline_dicts = _engine.build_timeline(harvest or view, apiary or {})
        timeline = [
            schemas.TraceJourneyStep(
                title=step.get("title") or "Trace event",
                date=step.get("date") or str(view.get("harvest_date") or ""),
                location=step.get("location") or str(apiary.get("location_name") or ""),
                description=step.get("description") or "",
                icon=step.get("icon") or "Package",
                data=step.get("data") if isinstance(step.get("data"), dict) else {},
                hash=step.get("hash"),
            )
            for step in timeline_dicts
        ]

        farmer_data = view.get("farmer") or {}
        apiary_data = view.get("apiary") or {}
        hive_data = view.get("hive") or {}

        return schemas.TraceResponse(
            batch_code=view.get("batch_code") or "",
            product_name=view.get("honey_type") or "Unknown Honey",
            harvest_date=view.get("harvest_date"),
            verified=view.get("verification_status") != "unverified",
            blockchain_verified=bool(view.get("blockchain_verified")),
            verification_url=view.get("verification_url") or "",
            verification_status=view.get("verification_status"),
            blockchain_status=view.get("blockchain_status"),
            completeness=view.get("completeness"),
            farmer=schemas.Farmer(**farmer_data) if farmer_data else None,
            apiary=schemas.Apiary(**apiary_data) if apiary_data else None,
            hive=schemas.Hive(**hive_data) if hive_data else None,
            story_title="Traceability Overview",
            story_content=(farmer_data.get("story") or "").strip(),
            impact_stats=await _get_impact_stats(token),
            sensor_snapshot=view.get("sensor_snapshot"),
            health_snapshot=view.get("health_snapshot"),
            florage_type=view.get("florage_type"),
            extra_metadata=view.get("extra_metadata") or {},
            timeline=timeline,
        )

    @staticmethod
    async def register_farmer(farmer_in: Any, token: Optional[str] = None) -> dict[str, Any]:
        farmer_data = _as_dict(farmer_in)
        record = {
            **farmer_data,
            "farmer_id": farmer_data.get("farmer_id") or farmer_data.get("id"),
        }
        await db_upsert("farmers", record, on_conflict="id", token=token)

        try:
            from app.blockchain.honey_chain import honey_blockchain

            honey_blockchain.register_farmer(record)
        except Exception as exc:
            record["_blockchain_error"] = str(exc)

        return record

    @staticmethod
    async def register_apiary(apiary_in: Any, token: Optional[str] = None) -> dict[str, Any]:
        apiary_data = _as_dict(apiary_in)
        record = {
            **apiary_data,
            "apiary_id": apiary_data.get("apiary_id") or apiary_data.get("id"),
        }
        await db_upsert("apiaries", record, on_conflict="id", token=token)

        try:
            from app.blockchain.honey_chain import honey_blockchain

            honey_blockchain.register_apiary(record)
        except Exception as exc:
            record["_blockchain_error"] = str(exc)

        return record

    @staticmethod
    async def register_hive(hive_in: Any, token: Optional[str] = None) -> dict[str, Any]:
        hive_data = _as_dict(hive_in)
        record = {
            **hive_data,
            "hive_id": hive_data.get("hive_id") or hive_data.get("id"),
        }
        await db_upsert("hives", record, on_conflict="id", token=token)

        try:
            from app.blockchain.honey_chain import honey_blockchain

            honey_blockchain.register_hive(record)
        except Exception as exc:
            record["_blockchain_error"] = str(exc)

        return record

    @staticmethod
    def record_sensor_data(sensor_in: Any) -> dict[str, Any]:
        payload = _as_dict(sensor_in)
        try:
            from app.blockchain.honey_chain import honey_blockchain

            block = honey_blockchain.record_sensor_data(payload)
            return {
                "success": True,
                "block_index": block.index,
                "hash": block.hash,
                "payload": payload,
            }
        except Exception as exc:
            return {"success": False, "error": str(exc), "payload": payload}

    @staticmethod
    async def record_harvest(harvest_in: Any, token: Optional[str] = None) -> dict[str, Any]:
        harvest_data = _as_dict(harvest_in)
        result = await db_insert("harvests", harvest_data, token=token)
        record = result.get("data", [harvest_data])[0] if result.get("success") else harvest_data

        try:
            from app.blockchain.honey_chain import honey_blockchain

            block = honey_blockchain.record_harvest(harvest_data)
            record["blockchain_hash"] = block.hash
        except Exception as exc:
            record["_blockchain_error"] = str(exc)

        return record

    @staticmethod
    async def get_all_harvests(limit: int = 100, token: Optional[str] = None) -> list[dict[str, Any]]:
        columns = "*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)"
        data = await db_select("harvests", columns=columns, order_by="date", ascending=False, limit=limit, token=token)
        normalized: list[dict[str, Any]] = []
        for harvest in data:
            view = await build_batch_view(None, harvest, token=token, include_live_snapshots=False)
            normalized.append(view.get("harvest") or harvest)
        return normalized

    @staticmethod
    async def get_all_apiaries(limit: int = 100, token: Optional[str] = None) -> list[dict[str, Any]]:
        return await db_select("apiaries", order_by="created_at", ascending=False, limit=limit, token=token)

    @staticmethod
    async def get_all_hives(limit: int = 100, token: Optional[str] = None) -> list[dict[str, Any]]:
        return await db_select("hives", order_by="created_at", ascending=False, limit=limit, token=token)

    @staticmethod
    async def create_batch(batch_in: Any, token: Optional[str] = None) -> dict[str, Any]:
        batch_data = _as_dict(batch_in)
        result = await db_insert("honey_batches", batch_data, token=token)
        record = result.get("data", [batch_data])[0] if result.get("success") else batch_data

        try:
            from app.blockchain.honey_chain import honey_blockchain

            block = honey_blockchain.create_batch(record)
            record["block_hash"] = block.hash
        except Exception as exc:
            record["_blockchain_error"] = str(exc)

        return record

    @staticmethod
    async def get_all_batches(limit: int = 100, token: Optional[str] = None) -> list[dict[str, Any]]:
        return await get_all_batch_views(token=token, limit=limit)

    @staticmethod
    async def get_history(batch_code: str, token: Optional[str] = None) -> Optional[schemas.TraceResponse]:
        return await TraceabilityService.get_trace_journey(batch_code, token=token)

    @staticmethod
    async def get_trace_journey(batch_code: str, token: Optional[str] = None) -> Optional[schemas.TraceResponse]:
        view = await get_batch_view_by_code(batch_code, token=token, include_live_snapshots=True)
        if not view:
            harvests = await db_select("harvests", filters={"batch_code": batch_code}, limit=1, token=token)
            if not harvests:
                return None

            harvest = harvests[0]
            farmer = await db_get_by_id("farmers", harvest.get("farmer_id"), token=token) if harvest.get("farmer_id") else None
            apiary = await db_get_by_id("apiaries", harvest.get("apiary_id"), token=token) if harvest.get("apiary_id") else None
            hive = await db_get_by_id("hives", harvest.get("hive_id"), token=token) if harvest.get("hive_id") else None
            view = {
                "batch_code": harvest.get("batch_code") or batch_code,
                "honey_type": harvest.get("honey_type"),
                "harvest_date": harvest.get("harvest_date"),
                "verification_status": "verified" if harvest.get("is_verified", True) else "unverified",
                "blockchain_verified": bool(harvest.get("blockchain_hash")),
                "harvest": harvest,
                "farmer": farmer,
                "apiary": apiary,
                "hive": hive,
                "sensor_snapshot": None,
                "health_snapshot": None,
                "extra_metadata": {},
            }
        return await TraceabilityService._build_trace_response(view, token=token)

    @staticmethod
    async def audit_account(email: Optional[str] = None, user_id: Optional[str] = None, token: Optional[str] = None) -> dict[str, Any]:
        return await audit_account_traceability(email=email, user_id=user_id, token=token)


TraceabilityService = TraceabilityService()


async def get_trace_journey(batch_code: str, token: Optional[str] = None) -> Optional[schemas.TraceResponse]:
    return await TraceabilityService.get_trace_journey(batch_code, token=token)
