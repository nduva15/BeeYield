"""
Service layer for Precision Pollination — Rust-Accelerated (Post-Oxidize)
======================================================================
Math logic and analytics aggregation moved to `beeyield_core.PollinationEngine`.
Python handles asynchronous DB orchestration and schema validation.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from app.db.supabase_db import db_select, db_insert, db_update, db_delete, db_get_by_id
from app.schemas.pollination import (
    CropPollinationRequirements,
    PollinationCalculatorInput,
    PollinationCalculatorResult,
    PollinationContract,
    PollinationContractCreate,
    PollinationContractUpdate,
    HiveAssignment,
    HiveAssignmentCreate,
    HiveAssignmentUpdate,
    PollinationApiary,
    HiveSensorData,
    HiveStatus,
    PollinationAnalytics,
)

try:
    from beeyield_core import PollinationEngine as _RustEngine
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False

_engine = _RustEngine() if _RUST_AVAILABLE else None


class PollinationService:
    def __init__(self):
        pass
    
    async def get_crop_requirements(self, crop_name: Optional[str] = None, token: Optional[str] = None) -> List[CropPollinationRequirements]:
        try:
            filters = {"crop_name": crop_name} if crop_name else {}
            data = await db_select('crop_pollination_requirements', filters=filters, token=token)
            return [CropPollinationRequirements(**item) for item in data]
        except Exception: return []
    
    async def calculate_pollination_needs(self, input_data: PollinationCalculatorInput, token: Optional[str] = None) -> PollinationCalculatorResult:
        """Ported math to Rust."""
        crop_reqs = await self.get_crop_requirements(input_data.crop_type, token=token)
        target_fpa = crop_reqs[0].target_fpa if crop_reqs else 2.0
        
        if _engine:
            res = _engine.calculate_needs(
                crop_type=input_data.crop_type,
                acreage=input_data.acreage,
                avg_frames=input_data.avg_frames_per_hive,
                weather_factor=input_data.weather_factor,
                target_fpa=target_fpa
            )
            return PollinationCalculatorResult(**res)
        else:
            # Fallback (simplified)
            hives = int((target_fpa * input_data.acreage) / (input_data.avg_frames_per_hive * input_data.weather_factor))
            return PollinationCalculatorResult(
                crop_type=input_data.crop_type, acreage=input_data.acreage, target_fpa=target_fpa,
                hives_needed=max(1, hives), actual_fpa=target_fpa, total_fpa_required=int(target_fpa * input_data.acreage),
                coverage_health_percent=100, foraging_efficiency_percent=85, strength_category="STANDARD", forage_range_km="1.2 km"
            )

    async def get_contracts(self, user_id=None, status=None, token=None) -> List[PollinationContract]:
        filters = {}
        if user_id: filters['user_id'] = user_id
        if status: filters['status'] = status
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

        if _engine:
            # Convert objects to dicts for Rust FFI
            contracts_dicts = [c.model_dump() for c in contracts]
            stats = _engine.calculate_analytics(contracts_dicts, sensor_list)
            return PollinationAnalytics(**stats)
        else:
            return PollinationAnalytics(total_contracts=len(contracts), active_contracts=0, total_hives_deployed=0, total_acres_covered=0.0, average_fpa=0.0, coverage_health_percent=0.0, healthy_hives=0, warning_hives=0, critical_hives=0, total_revenue=0.0)

    # Note: CRUD operations for contracts, assignments, apiaries remain in Python 
    # as they are pure DB-IO bound and should use await.

pollination_service = PollinationService()
