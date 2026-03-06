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
            # Python fallback timeline when Rust binary is unavailable
            timeline = TraceabilityService._build_python_timeline(harvest, farmer_data, apiary_data, hive_data)

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
    def _build_python_timeline(
        harvest: dict[str, Any],
        farmer: dict[str, Any],
        apiary: dict[str, Any],
        hive: dict[str, Any]
    ) -> list:
        """Pure-Python fallback for timeline when Rust core is not compiled."""
        steps = []

        # Step 1 — Farmer Registration
        if farmer:
            steps.append(schemas.TraceJourneyStep(
                title="Farmer Registration",
                date=farmer.get("registration_date") or farmer.get("created_at", ""),
                location=farmer.get("location_name", "Kenya"),
                description=f"{farmer.get('name', 'Beekeeper')} registered with BeeYield.",
                icon="user",
                data={"farmer_id": farmer.get("farmer_id") or farmer.get("id", "")},
            ))

        # Step 2 — Apiary Established
        if apiary:
            steps.append(schemas.TraceJourneyStep(
                title="Apiary Established",
                date=apiary.get("established_date") or apiary.get("created_at", ""),
                location=apiary.get("location_name") or apiary.get("name", ""),
                description=f"Apiary '{apiary.get('name', '')}' established in {apiary.get('county', apiary.get('region', 'Kenya'))}.",
                icon="map-pin",
                data={"apiary_id": apiary.get("apiary_id") or apiary.get("id", "")},
            ))

        # Step 3 — Hive Installed
        if hive:
            steps.append(schemas.TraceJourneyStep(
                title="Hive Installed",
                date=hive.get("installation_date") or hive.get("created_at", ""),
                location=apiary.get("location_name", "") if apiary else "",
                description=f"Hive {hive.get('hive_code', '')} ({hive.get('hive_type', 'Langstroth')}) installed.",
                icon="box",
                data={"hive_id": hive.get("hive_id") or hive.get("id", "")},
            ))

        # Step 4 — Harvest Recorded
        steps.append(schemas.TraceJourneyStep(
            title="Honey Harvested",
            date=harvest.get("harvest_date") or harvest.get("created_at", ""),
            location=apiary.get("location_name", "Kenya") if apiary else "Kenya",
            description=f"{harvest.get('quantity_kg', 0)} kg of {harvest.get('honey_type', 'honey')} harvested. Batch: {harvest.get('batch_code', 'N/A')}.",
            icon="droplets",
            data={"batch_code": harvest.get("batch_code", ""), "quantity_kg": harvest.get("quantity_kg", 0)},
        ))

        return steps

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
        """Reconstruct journey. Prioritizes DB (Smart Batching).
        Uses service_role_key to bypass RLS since this is a public lookup."""
        from app.core.config import settings
        # For public traceability lookups, use the service role key to bypass RLS
        lookup_token = token or getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
        try:
            harvests = await db_select("harvests", filters={"batch_code": batch_code}, token=lookup_token)
            if harvests:
                return await TraceabilityService._build_db_journey(harvests[0], token=lookup_token)
        except Exception as e:
            print(f"Journey reconstruction failed: {e}")
        return None

# Export class for __init__.py
TraceabilityService = TraceabilityService()

# Note: Blockhain write operations remain in Python as they are IO-bound and use local state.
