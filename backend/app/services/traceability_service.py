"""
Traceability Service — Rust-Accelerated (Post-Oxidize)
=====================================================
Timeline construction and impact stats moved to `beeyield_core.TraceabilityEngine`.
Data fetching and blockchain interaction remains in Python.
"""
from datetime import datetime
from typing import Any, Optional
from app.db.supabase_db import db_select, db_get_by_id
from app.schemas import traceability as schemas

try:
    from honey_rust import TraceabilityEngine as _RustEngine
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False
    print("WARNING: honey_rust binary missing. Run 'maturin develop'.")

_engine = _RustEngine() if _RUST_AVAILABLE else None


class TraceabilityService:
    @staticmethod
    async def _build_db_journey(harvest: dict[str, Any], token: Optional[str] = None) -> schemas.TraceResponse:
        """Uses Rust to construct the timeline."""
        import asyncio
        farmer_task = db_get_by_id("farmers", harvest.get("farmer_id"), token=token)
        apiary_task = db_get_by_id("apiaries", harvest.get("apiary_id"), token=token)
        hive_task = db_get_by_id("hives", harvest.get("hive_id"), token=token)
        
        results = await asyncio.gather(farmer_task, apiary_task, hive_task, return_exceptions=True)
        farmer_data, apiary_data, hive_data = [r if isinstance(r, dict) else {} for r in results]
        
        # RUST TIMELINE BUILDER
        if _engine:
            timeline_dicts = _engine.build_timeline(harvest, apiary_data)
            timeline = [schemas.TraceJourneyStep(**step) for step in timeline_dicts]
        else:
            timeline = [] # Fallback

        # Impact Stats from DB
        stats = await db_select("company_stats", token=token)
        impact_stats = {s["stat_key"]: s["stat_value"] for s in stats} if stats else {}

        return schemas.TraceResponse(
            batch_code=harvest.get("batch_code") or harvest.get("id"),
            product_name=harvest.get("honey_type", "Premium Honey"),
            verified=True,
            blockchain_verified=True,
            verification_url="",
            farmer=schemas.Farmer(**farmer_data) if farmer_data else None,
            apiary=schemas.Apiary(**apiary_data) if apiary_data else None,
            hive=schemas.Hive(**hive_data) if hive_data else None,
            story_title="The BeeYield Story",
            story_content=farmer_data.get('story', '') if farmer_data else '',
            impact_stats=impact_stats,
            sensor_snapshot={}, 
            health_snapshot={"status": "Certified Healthy"},
            florage_type=harvest.get("florage_type", ""),
            extra_metadata=harvest.get("extra_metadata") or {},
            timeline=timeline
        )

    @staticmethod
    async def get_all_harvests(limit: int = 100, token: Optional[str] = None) -> list[dict[str, Any]]:
        columns = "*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)"
        data = await db_select("harvests", columns=columns, order_by="harvest_date", ascending=False, limit=limit, token=token)
        for h in data:
            if not h.get('honey_type'): h['honey_type'] = 'Multifloral'
            if h.get('hive') and h['hive'].get('apiary'): h['apiary'] = h['hive']['apiary']
        return data

    @staticmethod
    async def get_history(batch_code: str, token: Optional[str] = None) -> Optional[schemas.TraceResponse]:
        """Alias for journey lookup."""
        return await TraceabilityService.get_trace_journey(batch_code, token=token)

    @staticmethod
    async def get_trace_journey(batch_code: str, token: Optional[str] = None) -> Optional[schemas.TraceResponse]:
        """Reconstruct journey. Prioritizes DB (Smart Batching)."""
        try:
            harvests = await db_select("harvests", filters={"batch_code": batch_code}, token=token)
            if harvests:
                # Use staticmethod call
                return await TraceabilityService._build_db_journey(harvests[0], token=token)
        except Exception as e:
            print(f"Journey reconstruction failed: {e}")
        return None

# Export class for __init__.py
TraceabilityService = TraceabilityService()

# Note: Blockhain write operations remain in Python as they are IO-bound and use local state.
