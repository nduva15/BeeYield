"""
Service layer for Precision Pollination — Rust-Accelerated (Post-Oxidize)
======================================================================
Math logic and analytics aggregation moved to `beeyield_core.PollinationEngine`.
Python handles asynchronous DB orchestration and schema validation.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid
from app.db.supabase_db import db_select, db_insert, db_update, db_delete
from app.schemas.pollination import (
    BloomSimulationInput,
    BloomSimulationResult,
    CropPollinationRequirements,
    PollinationCalculatorInput,
    PollinationCalculatorResult,
    PollinationContract,
    PollinationContractCreate,
    PollinationContractUpdate,
    PollinationAnalytics,
    HiveSensorData,
    PollinationActivityLog,
    HiveAssignment,
    HiveAssignmentCreate,
    HiveAssignmentUpdate,
    PollinationApiary,
    PollinationApiaryCreate,
    PollinationApiaryUpdate,
)

from beeyield_core import PollinationEngine as _RustEngine  # type: ignore
try:
    _engine = _RustEngine()
except Exception as e:
    print(f"Error initializing PollinationEngine: {e}")
    # Fallback or stub might be needed if Rust engine is not available
    _engine = None


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
            # Simple fallback if Rust engine is missing
            hives = int((target_fpa * input_data.acreage) / (input_data.avg_frames_per_hive * input_data.weather_factor))
            return PollinationCalculatorResult(
                crop_type=input_data.crop_type, acreage=input_data.acreage, target_fpa=target_fpa,
                hives_needed=max(1, hives), actual_fpa=target_fpa, total_fpa_required=target_fpa * input_data.acreage,
                coverage_health_percent=100, foraging_efficiency_percent=85, strength_category="STANDARD", forage_range_km="1.2 km"
            )

    async def simulate_bloom(self, input_data: BloomSimulationInput) -> BloomSimulationResult:
        """Simulate bloom-period colony output with Rust-managed modifiers."""
        if _engine:
            res = _engine.simulate_bloom(
                frame_count=input_data.frame_count,
                orientation=input_data.orientation,
                bees_per_frame=input_data.bees_per_frame,
                has_cover_crop=input_data.has_cover_crop,
                pesticide_stewardship=input_data.pesticide_stewardship,
                bloom_period_days=input_data.bloom_period_days,
                base_flight_hours=input_data.base_flight_hours,
            )
            return BloomSimulationResult(**res)
        raise RuntimeError("Rust PollinationEngine not available")

    async def get_contracts(self, user_id=None, status=None, token=None) -> List[PollinationContract]:
        filters = {}
        if user_id:
            filters['user_id'] = user_id
        if status:
            filters['status'] = status
        data = await db_select('pollination_contracts', filters=filters, order_by='created_at', ascending=False, token=token)
        return [PollinationContract(**item) for item in data]

    async def create_contract(self, contract_data: PollinationContractCreate, user_id: str, token: Optional[str] = None) -> Optional[PollinationContract]:
        payload = contract_data.model_dump()
        payload["user_id"] = user_id
        payload["contract_code"] = f"CON-{uuid.uuid4().hex[:8].upper()}"
        res = await db_insert('pollination_contracts', payload, token=token)
        if res.get("success"):
            data = res.get("data")
            return PollinationContract(**data[0]) if isinstance(data, list) else PollinationContract(**data)
        return None

    async def update_contract(self, contract_id: str, contract_data: PollinationContractUpdate, token: Optional[str] = None) -> Optional[PollinationContract]:
        payload = contract_data.model_dump(exclude_unset=True)
        payload["updated_at"] = datetime.utcnow().isoformat()
        res = await db_update('pollination_contracts', payload, {"id": contract_id}, token=token)
        if res.get("success"):
            data = res.get("data")
            return PollinationContract(**data[0]) if isinstance(data, list) else PollinationContract(**data)
        return None

    async def delete_contract(self, contract_id: str, token: Optional[str] = None) -> bool:
        res = await db_delete('pollination_contracts', {"id": contract_id}, token=token)
        return res.get("success", False)

    async def get_hive_assignments(self, contract_id=None, hive_id=None, active_only=False, token=None) -> List[HiveAssignment]:
        filters = {}
        if contract_id:
            filters['contract_id'] = contract_id
        if hive_id:
            filters['hive_id'] = hive_id
        if active_only:
            filters['removal_date'] = 'is.null'
        
        data = await db_select('hive_assignments', filters=filters, token=token)
        return [HiveAssignment(**item) for item in data]

    async def assign_hive(self, assignment_data: HiveAssignmentCreate, token: Optional[str] = None) -> Optional[HiveAssignment]:
        payload = assignment_data.model_dump()
        res = await db_insert('hive_assignments', payload, token=token)
        if res.get("success"):
            # Update contract hive count
            contract = await db_select('pollination_contracts', filters={'id': assignment_data.contract_id}, limit=1, token=token)
            if contract:
                new_count = contract[0].get('hive_count_deployed', 0) + 1
                await db_update('pollination_contracts', {'hive_count_deployed': new_count}, {'id': assignment_data.contract_id}, token=token)
            
            # Log activity
            await db_insert('pollination_activity_logs', {
                'contract_id': assignment_data.contract_id,
                'hive_id': assignment_data.hive_id,
                'activity_type': 'deployment',
                'activity_description': f"Hive {assignment_data.hive_id} deployed to contract.",
                'severity': 'info'
            }, token=token)

            data = res.get("data")
            return HiveAssignment(**data[0]) if isinstance(data, list) else HiveAssignment(**data)
        return None

    async def remove_hive_assignment(self, assignment_id: str, removal_date: date, token: Optional[str] = None) -> bool:
        assignment = await db_select('hive_assignments', filters={'id': assignment_id}, limit=1, token=token)
        if not assignment:
            return False
            
        res = await db_update('hive_assignments', {'removal_date': removal_date.isoformat()}, {'id': assignment_id}, token=token)
        if res.get("success"):
            # Update contract count
            contract_id = assignment[0].get('contract_id')
            contract = await db_select('pollination_contracts', filters={'id': contract_id}, limit=1, token=token)
            if contract:
                new_count = max(0, contract[0].get('hive_count_deployed', 0) - 1)
                await db_update('pollination_contracts', {'hive_count_deployed': new_count}, {'id': contract_id}, token=token)
            
            # Log activity
            await db_insert('pollination_activity_logs', {
                'contract_id': contract_id,
                'hive_id': assignment[0].get('hive_id'),
                'activity_type': 'removal',
                'activity_description': f"Hive {assignment[0].get('hive_id')} removed from contract.",
                'severity': 'info'
            }, token=token)
            return True
        return False

    async def update_hive_assignment(self, assignment_id: str, assignment_data: HiveAssignmentUpdate, token: Optional[str] = None) -> Optional[HiveAssignment]:
        payload = assignment_data.model_dump(exclude_unset=True)
        res = await db_update('hive_assignments', payload, {"id": assignment_id}, token=token)
        if res.get("success"):
            data = res.get("data")
            return HiveAssignment(**data[0]) if isinstance(data, list) else HiveAssignment(**data)
        return None

    async def get_hive_sensor_data(self, contract_id: Optional[str] = None, token: Optional[str] = None) -> List[HiveSensorData]:
        """Fetch real-time sensor data for hives involved in pollination."""
        # 1. Identify hives
        filters = {'removal_date': 'is.null'}
        if contract_id:
            filters['contract_id'] = contract_id
            
        assignments = await db_select('hive_assignments', filters=filters, token=token)
        hive_ids = [a.get('hive_id') for a in assignments]
        
        if not hive_ids:
            return []
            
        # 2. Get hive telemetry
        hives = await db_select('hives', filters={'id': hive_ids}, token=token)
        
        results = []
        for h in hives:
            # Transform DB column names to UI schema
            temp = h.get('latest_temp', 34.5) or 34.5
            hum = h.get('latest_humidity', 65.0) or 65.0
            acoustic = h.get('latest_acoustic_hz', 240) or 240
            
            stat = "healthy" if 33 <= temp <= 36 else "warning" if 32 <= temp <= 37 else "critical"
            
            results.append(HiveSensorData(
                hive_id=h['id'],
                hive_code=h.get('code', h['id'][:8]),
                status=stat,
                sensors={
                    "acoustics": {"value": acoustic, "trend": "stable", "trendValue": "Stable"},
                    "temperature": {"value": temp, "trend": "stable", "trendValue": "Stable"},
                    "humidity": {"value": hum, "trend": "stable", "trendValue": "Stable"},
                    "flight_activity": {"value": h.get('foraging_vpm', 30.0) or 30.0, "trend": "up", "trendValue": "+2%"}
                },
                frames_of_bees=h.get('frames_of_bees', 8) or 8,
                queen_status=h.get('queen_status', 'present') or 'present',
                last_sync="2m ago",
                location={"lat": h.get('latitude', -1.2), "lng": h.get('longitude', 36.8)}
            ))
            
        return results

    async def get_analytics(self, user_id: Optional[str] = None, token: Optional[str] = None) -> PollinationAnalytics:
        """Heavy lifting analytics moved to Rust."""
        contracts = await self.get_contracts(user_id=user_id, token=token)
        
        # Simple loop to get hive IDs across all active contracts
        hive_ids = []
        for c in [c for c in contracts if c.status == 'active']:
            assignments = await db_select('hive_assignments', filters={'contract_id': c.id, 'removal_date': 'is.null'}, token=token)
            hive_ids.extend([a['hive_id'] for a in assignments])
        
        # Get sensor data for these hives
        sensor_list = []
        if hive_ids:
            hives = await db_select('hives', filters={'id': hive_ids}, token=token)
            for h in hives:
                temp = h.get('latest_temp', 34.5) or 34.5
                stat = "healthy" if 33 <= temp <= 36 else "warning" if 32 <= temp <= 37 else "critical"
                sensor_list.append({"status": stat})

        if _engine:
            contracts_dicts = [c.model_dump() for c in contracts]
            stats = _engine.calculate_analytics(contracts_dicts, sensor_list)
            return PollinationAnalytics(**stats)
        else:
            # Fallback analytics if engine is missing
            active = [c for c in contracts if c.status == 'active']
            return PollinationAnalytics(
                total_contracts=len(contracts),
                active_contracts=len(active),
                total_hives_deployed=sum(c.hive_count_deployed for c in active),
                total_acres_covered=sum(c.farm_size_acres for c in active),
                average_fpa=2.1,
                coverage_health_percent=92.0,
                healthy_hives=len([s for s in sensor_list if s['status'] == 'healthy']),
                warning_hives=len([s for s in sensor_list if s['status'] == 'warning']),
                critical_hives=len([s for s in sensor_list if s['status'] == 'critical']),
                total_revenue=sum(c.payment_amount or 0 for c in contracts)
            )

    async def get_activity_logs(self, contract_id=None, limit=50, token=None) -> List[PollinationActivityLog]:
        filters = {}
        if contract_id:
            filters['contract_id'] = contract_id
        data = await db_select('pollination_activity_logs', filters=filters, limit=limit, order_by='timestamp', ascending=False, token=token)
        return [PollinationActivityLog(**item) for item in data]

    # --- Apiary Management ---
    async def get_pollination_apiaries(self, user_id=None, token=None) -> List[PollinationApiary]:
        filters = {}
        if user_id:
            filters['user_id'] = user_id
        data = await db_select('apiaries', filters=filters, token=token)
        results = []
        for item in data:
            # In a real app, we'd query hives specifically, for now we map common fields
            results.append(PollinationApiary(
                id=item['id'],
                name=item['name'],
                location=item.get('location', 'Unknown'),
                latitude=item.get('latitude'),
                longitude=item.get('longitude'),
                total_hives=item.get('total_hives', 0),
                available_hives=item.get('available_hives', 0),
                user_id=item.get('user_id'),
                created_at=item.get('created_at'),
                updated_at=item.get('updated_at')
            ))
        return results

    async def get_pollination_apiary(self, apiary_id, user_id=None, token=None) -> Optional[PollinationApiary]:
        filters = {'id': apiary_id}
        if user_id:
            filters['user_id'] = user_id
        data = await db_select('apiaries', filters=filters, limit=1, token=token)
        if data:
            item = data[0]
            return PollinationApiary(
                id=item['id'],
                name=item['name'],
                location=item.get('location', 'Unknown'),
                latitude=item.get('latitude'),
                longitude=item.get('longitude'),
                total_hives=item.get('total_hives', 0),
                available_hives=item.get('available_hives', 0),
                user_id=item.get('user_id'),
                created_at=item.get('created_at'),
                updated_at=item.get('updated_at')
            )
        return None

    async def create_pollination_apiary(self, apiary_data: PollinationApiaryCreate, user_id, token=None) -> Optional[PollinationApiary]:
        payload = apiary_data.model_dump()
        payload["user_id"] = user_id
        res = await db_insert('apiaries', payload, token=token)
        if res.get("success"):
            return await self.get_pollination_apiary(res["data"][0]["id"], token=token)
        return None

    async def update_pollination_apiary(self, apiary_id, apiary_data: PollinationApiaryUpdate, token=None) -> Optional[PollinationApiary]:
        payload = apiary_data.model_dump(exclude_unset=True)
        res = await db_update('apiaries', payload, {"id": apiary_id}, token=token)
        if res.get("success"):
            return await self.get_pollination_apiary(apiary_id, token=token)
        return None

    async def delete_pollination_apiary(self, apiary_id, token=None) -> bool:
        res = await db_delete('apiaries', {"id": apiary_id}, token=token)
        return res.get("success", False)


pollination_service = PollinationService()
