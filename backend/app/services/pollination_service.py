"""
Service layer for Precision Pollination — Rust-Accelerated (Post-Oxidize)
======================================================================
Math logic and analytics aggregation moved to `beeyield_core.PollinationEngine`.
Python handles asynchronous DB orchestration and schema validation.
"""
from typing import List, Optional
from app.db.supabase_db import db_select
from app.schemas.pollination import (
    CropPollinationRequirements,
    PollinationCalculatorInput,
    PollinationCalculatorResult,
    PollinationContract,
    PollinationAnalytics,
)

from beeyield_core import PollinationEngine as _RustEngine  # type: ignore
_engine = _RustEngine()


class PollinationService:
    def __init__(self):
        pass

    _ALLOWED_CROPS = [
        "Maize",
        "Sisal",
        "Mangoes",
        "Beans",
        "Sunflower",
        "Oranges",
        "Vegetables",
        "Tomatoes",
        "Onions",
    ]
    _ALLOWED_CROPS_SET = {c.lower(): c for c in _ALLOWED_CROPS}
    
    async def get_crop_requirements(self, crop_name: Optional[str] = None, token: Optional[str] = None) -> List[CropPollinationRequirements]:
        try:
            canonical = None
            if crop_name:
                canonical = self._ALLOWED_CROPS_SET.get(str(crop_name).strip().lower())
            filters = {"crop_name": canonical} if canonical else {}
            data = await db_select('crop_pollination_requirements', filters=filters, token=token)
            allowed = self._ALLOWED_CROPS_SET
            filtered = [item for item in data if allowed.get(str(item.get("crop_name", "")).strip().lower())]
            ordered = sorted(
                filtered,
                key=lambda item: self._ALLOWED_CROPS.index(
                    allowed.get(str(item.get("crop_name", "")).strip().lower())
                ),
            )
            return [CropPollinationRequirements(**item) for item in ordered]
        except Exception:
            return []
    
    async def calculate_pollination_needs(self, input_data: PollinationCalculatorInput, token: Optional[str] = None) -> PollinationCalculatorResult:
        """Ported math to Rust."""
        crop_reqs = await self.get_crop_requirements(input_data.crop_type, token=token)
        target_fpa = crop_reqs[0].target_fpa if crop_reqs else 2.0
        
        res = _engine.calculate_needs(
            crop_type=input_data.crop_type,
            acreage=input_data.acreage,
            avg_frames=input_data.avg_frames_per_hive,
            weather_factor=input_data.weather_factor,
            target_fpa=target_fpa
        )
        return PollinationCalculatorResult(**res)

    async def get_contracts(self, user_id=None, status=None, token=None) -> List[PollinationContract]:
        filters = {}
        if user_id:
            filters['user_id'] = user_id
        if status:
            filters['status'] = status
        data = await db_select('pollination_contracts', filters=filters, order_by='created_at', ascending=False, token=token)
        return [PollinationContract(**item) for item in data]

    async def get_analytics(self, user_id: Optional[str] = None, token: Optional[str] = None) -> PollinationAnalytics:
        """Heavy lifting analytics moved to Rust."""
        contracts = await self.get_contracts(user_id=user_id, token=token)
        
        # Simple loop to get hive IDs across all active contracts
        hive_ids = []
        for c in [c for c in contracts if c.status == 'active']:
            assignments = await db_select('hive_assignments', filters={'contract_id': c.id}, token=token)
            hive_ids.extend([a['hive_id'] for a in assignments if a.get('removal_date') is None])
        
        # Get sensor data for these hives
        sensor_list = []
        if hive_ids:
            hives = await db_select('hives', filters={'id': hive_ids}, token=token)
            for h in hives:
                temp = h.get('latest_temp', 34.5) or 34.5
                stat = "healthy" if 33 <= temp <= 36 else "warning" if 32 <= temp <= 37 else "critical"
                sensor_list.append({"status": stat})

        contracts_dicts = [c.model_dump() for c in contracts]
        stats = _engine.calculate_analytics(contracts_dicts, sensor_list)
        return PollinationAnalytics(**stats)

    # Note: CRUD operations for contracts, assignments, apiaries remain in Python 
    # as they are pure DB-IO bound and should use await.

pollination_service = PollinationService()
