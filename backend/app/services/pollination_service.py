"""
Service layer for Precision Pollination operations
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
    PollinationApiaryCreate,
    PollinationApiaryUpdate,
    HiveSensorData,
    HiveStatus,
    PollinationAnalytics,
    PollinationActivityLog
)
import math
import uuid


class PollinationService:
    """Service for managing precision pollination operations"""
    
    def __init__(self):
        pass
    
    # ========== CROP REQUIREMENTS ==========
    
    async def get_crop_requirements(self, crop_name: Optional[str] = None, token: Optional[str] = None) -> List[CropPollinationRequirements]:
        """Get pollination requirements for crops"""
        try:
            filters = {}
            if crop_name:
                filters["crop_name"] = crop_name
            
            data = await db_select('crop_pollination_requirements', filters=filters, token=token)
            return [CropPollinationRequirements(**item) for item in data]
        except Exception as e:
            print(f"Error fetching crop requirements: {e}")
            return []
    
    # ========== POLLINATION CALCULATOR ==========
    
    async def calculate_pollination_needs(self, input_data: PollinationCalculatorInput, token: Optional[str] = None) -> PollinationCalculatorResult:
        """Calculate pollination requirements based on crop and acreage"""
        # Get crop requirements
        crop_reqs = await self.get_crop_requirements(input_data.crop_type, token=token)
        
        if not crop_reqs:
            # Default values if crop not found
            target_fpa = 2.0
        else:
            target_fpa = crop_reqs[0].target_fpa
        
        # Calculate colony strength multiplier
        avg_frames = input_data.avg_frames_per_hive
        strength_multiplier = math.pow(avg_frames / 8, 1.35)
        effective_fob = avg_frames * strength_multiplier
        
        # Apply weather penalty
        weather_penalty = input_data.weather_factor
        adjusted_fob = effective_fob * weather_penalty
        
        # Calculate hives needed
        total_fpa_required = target_fpa * input_data.acreage
        hives_needed = math.ceil(total_fpa_required / adjusted_fob)
        
        # Calculate actual FPA with the hives needed
        actual_fpa = (hives_needed * avg_frames * weather_penalty) / input_data.acreage
        
        # Calculate coverage health percentage
        coverage_health = min(100, round((actual_fpa / target_fpa) * 100))
        
        # Calculate foraging efficiency
        foraging_efficiency = min(98, round(75 + (avg_frames - 6) * 3.2))
        
        # Determine strength category
        if avg_frames >= 11:
            strength_category = "ELITE"
            forage_range = "1.8 km"
        elif avg_frames >= 9:
            strength_category = "OPTIMAL"
            forage_range = "1.5 km"
        elif avg_frames >= 7:
            strength_category = "STANDARD"
            forage_range = "1.2 km"
        else:
            strength_category = "MINIMUM"
            forage_range = "1.0 km"
        
        return PollinationCalculatorResult(
            crop_type=input_data.crop_type,
            acreage=input_data.acreage,
            target_fpa=target_fpa,
            hives_needed=hives_needed,
            actual_fpa=round(actual_fpa, 1),
            total_fpa_required=round(total_fpa_required),
            coverage_health_percent=coverage_health,
            foraging_efficiency_percent=foraging_efficiency,
            strength_category=strength_category,
            forage_range_km=forage_range
        )
    
    # ========== CONTRACTS ==========
    
    async def get_contracts(
        self, 
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        farmer_id: Optional[str] = None,
        token: Optional[str] = None
    ) -> List[PollinationContract]:
        """Get pollination contracts with optional filters"""
        try:
            filters = {}
            if user_id:
                filters['user_id'] = user_id
            if status:
                filters['status'] = status
            if farmer_id:
                filters['farmer_id'] = farmer_id
            
            data = await db_select('pollination_contracts', filters=filters, order_by='created_at', ascending=False, token=token)
            
            return [PollinationContract(**item) for item in data]
        except Exception as e:
            print(f"Error fetching contracts: {e}")
            return []
    
    async def create_contract(
        self, 
        contract_data: PollinationContractCreate,
        user_id: str,
        token: Optional[str] = None
    ) -> Optional[PollinationContract]:
        """Create a new pollination contract"""
        try:
            # Generate contract code
            contract_code = f"PC-{datetime.now().strftime('%Y%m%d')}-{hash(str(datetime.now()))%10000:04d}"
            
            data = {
                **contract_data.model_dump(),
                'contract_code': contract_code,
                'user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            result = await db_insert('pollination_contracts', data, token=token)
            
            if result.get("success") and result.get("data"):
                # Log activity
                await self._log_activity(
                    contract_id=result['data'][0]['id'],
                    activity_type='contract_created',
                    description=f"New pollination contract created for {contract_data.crop_type} on {contract_data.farm_size_acres} acres",
                    severity='success',
                    token=token
                )
                return PollinationContract(**result['data'][0])
            return None
        except Exception as e:
            print(f"Error creating contract: {e}")
            return None
    
    async def update_contract(
        self,
        contract_id: str,
        contract_data: PollinationContractUpdate,
        token: Optional[str] = None
    ) -> Optional[PollinationContract]:
        """Update an existing pollination contract"""
        try:
            data = {
                **contract_data.model_dump(exclude_unset=True),
                'updated_at': datetime.now().isoformat()
            }
            
            result = await db_update('pollination_contracts', data, {'id': contract_id}, token=token)
            
            if result.get("success") and result.get("data"):
                return PollinationContract(**result['data'][0])
            return None
        except Exception as e:
            print(f"Error updating contract: {e}")
            return None
    
    async def delete_contract(self, contract_id: str, token: Optional[str] = None) -> bool:
        """Delete a pollination contract"""
        try:
            result = await db_delete('pollination_contracts', {'id': contract_id}, token=token)
            return result.get("success", False)
        except Exception as e:
            print(f"Error deleting contract: {e}")
            return False
    
    # ========== HIVE ASSIGNMENTS ==========
    
    async def get_hive_assignments(
        self,
        contract_id: Optional[str] = None,
        hive_id: Optional[str] = None,
        active_only: bool = False,
        token: Optional[str] = None
    ) -> List[HiveAssignment]:
        """Get hive assignments"""
        try:
            filters = {}
            if contract_id:
                filters['contract_id'] = contract_id
            if hive_id:
                filters['hive_id'] = hive_id
            
            # Note: RLS handles the rest. active_only needs a special filter for IS NULL
            # For now, we'll fetch all and filter if needed, or if db_select supports null
            data = await db_select('hive_assignments', filters=filters, token=token)
            
            if active_only:
                data = [item for item in data if item.get('removal_date') is None]
            
            return [HiveAssignment(**item) for item in data]
        except Exception as e:
            print(f"Error fetching hive assignments: {e}")
            return []
    
    async def assign_hive(
        self,
        assignment_data: HiveAssignmentCreate,
        token: Optional[str] = None
    ) -> Optional[HiveAssignment]:
        """Assign a hive to a pollination contract"""
        try:
            # Convert placement_coordinates dict to separate lat/lng fields
            data = assignment_data.model_dump()
            if data.get('placement_coordinates'):
                coords = data.pop('placement_coordinates')
                data['placement_lat'] = coords.get('lat')
                data['placement_lng'] = coords.get('lng')
            
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()
            
            result = await db_insert('hive_assignments', data, token=token)
            
            if result.get("success") and result.get("data"):
                # Update contract's hive_count_deployed
                await self._update_contract_hive_count(assignment_data.contract_id, token=token)
                
                # Log activity
                await self._log_activity(
                    contract_id=assignment_data.contract_id,
                    hive_id=assignment_data.hive_id,
                    activity_type='hive_deployed',
                    description=f"Hive {assignment_data.hive_id} deployed to contract",
                    severity='success',
                    token=token
                )
                
                return HiveAssignment(**result['data'][0])
            return None
        except Exception as e:
            print(f"Error assigning hive: {e}")
            return None
    
    async def remove_hive_assignment(
        self,
        assignment_id: str,
        removal_date: date,
        token: Optional[str] = None
    ) -> bool:
        """Remove a hive from a pollination contract"""
        try:
            # Get the assignment first to get contract_id
            assignment = await db_get_by_id('hive_assignments', assignment_id, token=token)
            
            if not assignment:
                return False
            
            contract_id = assignment['contract_id']
            hive_id = assignment['hive_id']
            
            # Update the assignment
            result = await db_update('hive_assignments', {
                    'removal_date': removal_date.isoformat(),
                    'updated_at': datetime.now().isoformat()
                }, {'id': assignment_id}, token=token)
            
            # Update contract's hive_count_deployed
            await self._update_contract_hive_count(contract_id, token=token)
            
            # Log activity
            await self._log_activity(
                contract_id=contract_id,
                hive_id=hive_id,
                activity_type='hive_removed',
                description=f"Hive {hive_id} removed from contract",
                severity='info',
                token=token
            )
            
            return True
        except Exception as e:
            print(f"Error removing hive assignment: {e}")
            return False
    
    async def update_hive_assignment(
        self,
        assignment_id: str,
        assignment_data: HiveAssignmentUpdate,
        token: Optional[str] = None
    ) -> Optional[HiveAssignment]:
        """Update an existing hive assignment"""
        try:
            data = assignment_data.model_dump(exclude_unset=True)
            
            # Handle coordinates if provided
            if 'placement_coordinates' in data and data['placement_coordinates']:
                coords = data.pop('placement_coordinates')
                data['placement_lat'] = coords.get('lat')
                data['placement_lng'] = coords.get('lng')
            
            data['updated_at'] = datetime.now().isoformat()
            
            result = await db_update('hive_assignments', data, {'id': assignment_id}, token=token)
            
            if result.get("success") and result.get("data"):
                return HiveAssignment(**result['data'][0])
            return None
        except Exception as e:
            print(f"Error updating hive assignment: {e}")
            return None
    
    # ========== POLLINATION APIARIES ==========
    
    async def get_pollination_apiaries(
        self,
        user_id: Optional[str] = None,
        token: Optional[str] = None
    ) -> List[PollinationApiary]:
        """Get all apiaries available for pollination with hive availability"""
        try:
            filters = {}
            if user_id:
                filters['user_id'] = user_id
            
            data = await db_select('apiaries', filters=filters, order_by='created_at', ascending=False, token=token)
            
            apiaries = []
            for apiary in data:
                # Get hive count for this apiary
                hives_data = await db_select('hives', filters={'apiary_id': apiary['id']}, token=token)
                total_hives = len(hives_data)
                
                # Get active assignments for hives in this apiary
                assigned_hive_ids = set()
                if hives_data:
                    hive_ids = [h['id'] for h in hives_data]
                    # PostgREST IN filter
                    assignments = await db_select('hive_assignments', filters={'hive_id': hive_ids}, token=token)
                    assigned_hive_ids = {a['hive_id'] for a in assignments if a.get('removal_date') is None}
                
                available_hives = total_hives - len(assigned_hive_ids)
                
                apiaries.append(PollinationApiary(
                    id=apiary['id'],
                    user_id=apiary.get('user_id'),
                    name=apiary.get('name', 'Unnamed Apiary'),
                    location=apiary.get('location_name') or apiary.get('county') or 'Unknown',
                    latitude=apiary.get('latitude'),
                    longitude=apiary.get('longitude'),
                    total_hives=total_hives,
                    available_hives=available_hives,
                    notes=apiary.get('notes'),
                    created_at=apiary.get('created_at', datetime.now().isoformat()),
                    updated_at=apiary.get('updated_at')
                ))
            
            return apiaries
        except Exception as e:
            print(f"Error fetching pollination apiaries: {e}")
            return []
    
    async def get_pollination_apiary(
        self,
        apiary_id: str,
        user_id: Optional[str] = None,
        token: Optional[str] = None
    ) -> Optional[PollinationApiary]:
        """Get a single apiary with pollination data"""
        try:
            apiary = await db_get_by_id('apiaries', apiary_id, token=token)
            
            if not apiary:
                return None
            
            if user_id and apiary.get('user_id') != user_id:
                return None
            
            # Get hive count
            hives_data = await db_select('hives', filters={'apiary_id': apiary_id}, token=token)
            total_hives = len(hives_data)
            
            # Get available hives
            assigned_hive_ids = set()
            if hives_data:
                hive_ids = [h['id'] for h in hives_data]
                assignments = await db_select('hive_assignments', filters={'hive_id': hive_ids}, token=token)
                assigned_hive_ids = {a['hive_id'] for a in assignments if a.get('removal_date') is None}
            
            available_hives = total_hives - len(assigned_hive_ids)
            
            return PollinationApiary(
                id=apiary['id'],
                user_id=apiary.get('user_id'),
                name=apiary.get('name', 'Unnamed Apiary'),
                location=apiary.get('location_name') or apiary.get('county') or 'Unknown',
                latitude=apiary.get('latitude'),
                longitude=apiary.get('longitude'),
                total_hives=total_hives,
                available_hives=available_hives,
                notes=apiary.get('notes'),
                created_at=apiary.get('created_at', datetime.now().isoformat()),
                updated_at=apiary.get('updated_at')
            )
        except Exception as e:
            print(f"Error fetching pollination apiary: {e}")
            return None
    
    async def create_pollination_apiary(
        self,
        apiary_data: PollinationApiaryCreate,
        user_id: str,
        token: Optional[str] = None
    ) -> Optional[PollinationApiary]:
        """Create a new apiary for pollination"""
        try:
            # Generate apiary code
            apiary_code = f"APY-{str(uuid.uuid4())[:8].upper()}"
            
            data = {
                'name': apiary_data.name,
                'location_name': apiary_data.location,
                'latitude': apiary_data.latitude,
                'longitude': apiary_data.longitude,
                'notes': apiary_data.notes,
                'apiary_code': apiary_code,
                'user_id': user_id,
                'is_active': True,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            result = await db_insert('apiaries', data, token=token)
            
            if result.get("success") and result.get("data"):
                return await self.get_pollination_apiary(result['data'][0]['id'], token=token)
            return None
        except Exception as e:
            print(f"Error creating pollination apiary: {e}")
            return None
    
    async def update_pollination_apiary(
        self,
        apiary_id: str,
        apiary_data: PollinationApiaryUpdate,
        token: Optional[str] = None
    ) -> Optional[PollinationApiary]:
        """Update an existing apiary"""
        try:
            data = apiary_data.model_dump(exclude_unset=True)
            
            # Map location to location_name
            if 'location' in data:
                data['location_name'] = data.pop('location')
            
            data['updated_at'] = datetime.now().isoformat()
            
            result = await db_update('apiaries', data, {'id': apiary_id}, token=token)
            
            if result.get("success") and result.get("data"):
                return await self.get_pollination_apiary(apiary_id, token=token)
            return None
        except Exception as e:
            print(f"Error updating pollination apiary: {e}")
            return None
    
    async def delete_pollination_apiary(self, apiary_id: str, token: Optional[str] = None) -> bool:
        """Soft delete a pollination apiary by setting is_active to False"""
        try:
            result = await db_update('apiaries', {'is_active': False, 'updated_at': datetime.now().isoformat()}, {'id': apiary_id}, token=token)
            return result.get("success", False)
        except Exception as e:
            print(f"Error deleting pollination apiary: {e}")
            return False
    
    # ========== HIVE SENSOR DATA ==========
    
    async def get_hive_sensor_data(
        self,
        contract_id: Optional[str] = None,
        hive_ids: Optional[List[str]] = None,
        token: Optional[str] = None
    ) -> List[HiveSensorData]:
        """Get real-time sensor data for hives"""
        try:
            # Get hives from assignments if contract_id provided
            if contract_id:
                assignments = await self.get_hive_assignments(contract_id=contract_id, active_only=True, token=token)
                hive_ids = [a.hive_id for a in assignments]
            
            # PostgREST IN filter for hive_ids
            filters = {}
            if hive_ids:
                filters['id'] = hive_ids
            
            hives_data = await db_select('hives', filters=filters, token=token)
            
            # Transform hive data to sensor data format
            sensor_data = []
            for hive in hives_data:
                # Fetch apiary details
                apiary = await db_get_by_id('apiaries', hive.get('apiary_id'), token=token) if hive.get('apiary_id') else {}
                
                # Simulate sensor readings (in production, this would come from IoT devices)
                temp = hive.get('latest_temp', 34.5) or 34.5
                humidity = hive.get('latest_humidity', 65) or 65
                
                # Determine status based on sensor readings
                if temp < 32 or temp > 37:
                    status = HiveStatus.CRITICAL
                elif temp < 33 or temp > 36 or humidity > 72:
                    status = HiveStatus.WARNING
                else:
                    status = HiveStatus.HEALTHY
                
                sensor_data.append(HiveSensorData(
                    hive_id=hive['id'],
                    hive_code=hive['hive_code'],
                    status=status,
                    sensors={
                        'acoustics': {'value': 235, 'trend': 'stable', 'trendValue': 'Stable'},
                        'temperature': {'value': temp, 'trend': 'stable', 'trendValue': 'Stable'},
                        'humidity': {'value': humidity, 'trend': 'down', 'trendValue': '-1.2%'},
                        'flight_activity': {'value': 38.5, 'trend': 'up', 'trendValue': '+5%'}
                    },
                    frames_of_bees=hive.get('frame_count', 8) or 8,
                    queen_status='present',
                    last_sync='Just now',
                    location={
                        'lat': apiary.get('latitude', -1.2921),
                        'lng': apiary.get('longitude', 36.8219)
                    } if apiary else None
                ))
            
            return sensor_data
        except Exception as e:
            print(f"Error fetching hive sensor data: {e}")
            return []
    
    # ========== ANALYTICS ==========
    
    async def get_analytics(self, user_id: Optional[str] = None, token: Optional[str] = None) -> PollinationAnalytics:
        """Get pollination analytics"""
        try:
            # Get contracts
            contracts = await self.get_contracts(user_id=user_id, token=token)
            active_contracts = [c for c in contracts if c.status == 'active']
            
            # Get all hive assignments
            all_assignments = []
            for contract in active_contracts:
                assignments = await self.get_hive_assignments(contract_id=contract.id, active_only=True, token=token)
                all_assignments.extend(assignments)
            
            # Get sensor data for all assigned hives
            hive_ids = [a.hive_id for a in all_assignments]
            sensor_data = await self.get_hive_sensor_data(hive_ids=hive_ids, token=token) if hive_ids else []
            
            # Calculate statistics
            total_hives_deployed = len(all_assignments)
            total_acres_covered = sum(c.farm_size_acres for c in active_contracts)
            
            # Calculate average FPA
            total_fpa = sum(c.actual_fpa or c.target_fpa for c in active_contracts)
            avg_fpa = total_fpa / len(active_contracts) if active_contracts else 0
            
            # Calculate coverage health
            coverage_health = 0
            if active_contracts:
                coverage_values = []
                for c in active_contracts:
                    actual = c.actual_fpa or c.target_fpa
                    coverage = min(100, (actual / c.target_fpa) * 100)
                    coverage_values.append(coverage)
                coverage_health = sum(coverage_values) / len(coverage_values)
            
            # Count hive statuses
            healthy_hives = sum(1 for h in sensor_data if h.status == HiveStatus.HEALTHY)
            warning_hives = sum(1 for h in sensor_data if h.status == HiveStatus.WARNING)
            critical_hives = sum(1 for h in sensor_data if h.status == HiveStatus.CRITICAL)
            
            # Calculate revenue
            total_revenue = sum(c.payment_amount or 0 for c in contracts if c.payment_status == 'paid')
            
            return PollinationAnalytics(
                total_contracts=len(contracts),
                active_contracts=len(active_contracts),
                total_hives_deployed=total_hives_deployed,
                total_acres_covered=total_acres_covered,
                average_fpa=round(avg_fpa, 2),
                coverage_health_percent=round(coverage_health, 1),
                healthy_hives=healthy_hives,
                warning_hives=warning_hives,
                critical_hives=critical_hives,
                total_revenue=total_revenue
            )
        except Exception as e:
            print(f"Error calculating analytics: {e}")
            return PollinationAnalytics(
                total_contracts=0,
                active_contracts=0,
                total_hives_deployed=0,
                total_acres_covered=0.0,
                average_fpa=0.0,
                coverage_health_percent=0.0,
                healthy_hives=0,
                warning_hives=0,
                critical_hives=0,
                total_revenue=0.0
            )
    
    # ========== ACTIVITY LOGS ==========
    
    async def get_activity_logs(
        self,
        contract_id: Optional[str] = None,
        limit: int = 50,
        token: Optional[str] = None
    ) -> List[PollinationActivityLog]:
        """Get activity logs"""
        try:
            filters = {}
            if contract_id:
                filters['contract_id'] = contract_id
            
            data = await db_select('pollination_activity_logs', filters=filters, order_by='timestamp', ascending=False, limit=limit, token=token)
            
            return [PollinationActivityLog(**item) for item in data]
        except Exception as e:
            print(f"Error fetching activity logs: {e}")
            return []
    
    async def _log_activity(
        self,
        activity_type: str,
        description: str,
        contract_id: Optional[str] = None,
        hive_id: Optional[str] = None,
        severity: str = 'info',
        metadata: Optional[Dict[str, Any]] = None,
        token: Optional[str] = None
    ):
        """Internal method to log activities"""
        try:
            data = {
                'activity_type': activity_type,
                'activity_description': description,
                'severity': severity,
                'timestamp': datetime.now().isoformat()
            }
            
            if contract_id:
                data['contract_id'] = contract_id
            if hive_id:
                data['hive_id'] = hive_id
            if metadata:
                data['metadata'] = metadata
            
            await db_insert('pollination_activity_logs', data, token=token)
        except Exception as e:
            print(f"Error logging activity: {e}")
    
    async def _update_contract_hive_count(self, contract_id: str, token: Optional[str] = None):
        """Update the hive_count_deployed for a contract"""
        try:
            # Count active assignments
            assignments = await self.get_hive_assignments(contract_id=contract_id, active_only=True, token=token)
            count = len(assignments)
            
            # Update contract
            await db_update('pollination_contracts', {'hive_count_deployed': count}, {'id': contract_id}, token=token)
        except Exception as e:
            print(f"Error updating contract hive count: {e}")


# Singleton instance
pollination_service = PollinationService()
