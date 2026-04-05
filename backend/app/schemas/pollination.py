"""
Pydantic schemas for Precision Pollination module
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


class CropType(str, Enum):
    """Supported crop types for pollination"""
    SUNFLOWER = "Sunflower"
    AVOCADO = "Avocado"
    MACADAMIA = "Macadamia"
    COFFEE = "Coffee"
    MANGO = "Mango"
    WATERMELON = "Watermelon"
    CUCUMBER = "Cucumber"
    TOMATO = "Tomato"
    STRAWBERRY = "Strawberry"
    BLUEBERRY = "Blueberry"


class ContractStatus(str, Enum):
    """Contract status types"""
    ACTIVE = "active"
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class HiveStatus(str, Enum):
    """Hive health status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"


# ========== CROP DATA SCHEMAS ==========

class CropPollinationRequirements(BaseModel):
    """Pollination requirements for a specific crop"""
    crop_name: str
    target_fpa: float = Field(..., description="Target Frames Per Acre")
    min_fpa: float = Field(..., description="Minimum Frames Per Acre")
    optimal_fpa: float = Field(..., description="Optimal Frames Per Acre")
    bloom_period_days: int = Field(..., description="Typical bloom period in days")
    pollination_dependency: str = Field(..., description="High/Medium/Low dependency on bees")
    expected_yield_increase_percent: float = Field(..., description="Expected yield increase with optimal pollination")
    
    class Config:
        json_schema_extra = {
            "example": {
                "crop_name": "Sunflower",
                "target_fpa": 2.0,
                "min_fpa": 1.5,
                "optimal_fpa": 2.5,
                "bloom_period_days": 21,
                "pollination_dependency": "High",
                "expected_yield_increase_percent": 35.0
            }
        }


# ========== POLLINATION CONTRACT SCHEMAS ==========

class PollinationContractBase(BaseModel):
    """Base schema for pollination contracts"""
    farmer_id: Optional[str] = None
    crop_type: str
    farm_location: str
    farm_size_acres: float
    contract_start_date: date
    contract_end_date: date
    hive_count_required: int
    hive_count_deployed: int = 0
    target_fpa: float
    actual_fpa: Optional[float] = None
    status: ContractStatus = ContractStatus.PENDING
    payment_amount: Optional[float] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class PollinationContractCreate(PollinationContractBase):
    """Schema for creating a new pollination contract"""
    pass


class PollinationContractUpdate(BaseModel):
    """Schema for updating a pollination contract"""
    crop_type: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size_acres: Optional[float] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    hive_count_required: Optional[int] = None
    hive_count_deployed: Optional[int] = None
    target_fpa: Optional[float] = None
    actual_fpa: Optional[float] = None
    status: Optional[ContractStatus] = None
    payment_amount: Optional[float] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class PollinationContract(PollinationContractBase):
    """Full pollination contract with ID and timestamps"""
    id: str
    contract_code: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== HIVE ASSIGNMENT SCHEMAS ==========

class HiveAssignmentBase(BaseModel):
    """Base schema for hive assignments to pollination contracts"""
    contract_id: str
    hive_id: str
    assignment_date: date
    removal_date: Optional[date] = None
    placement_location: Optional[str] = None
    placement_coordinates: Optional[Dict[str, float]] = None  # {"lat": -1.29, "lng": 36.82}
    notes: Optional[str] = None


class HiveAssignmentCreate(HiveAssignmentBase):
    """Schema for creating a hive assignment"""
    pass


class HiveAssignment(HiveAssignmentBase):
    """Full hive assignment with ID and timestamps"""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class HiveAssignmentUpdate(BaseModel):
    """Schema for updating a hive assignment"""
    placement_location: Optional[str] = None
    placement_coordinates: Optional[Dict[str, float]] = None
    notes: Optional[str] = None


# ========== POLLINATION APIARY SCHEMAS ==========

class PollinationApiaryBase(BaseModel):
    """Apiary data in pollination context"""
    name: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_hives: int = 0
    available_hives: int = 0
    notes: Optional[str] = None


class PollinationApiaryCreate(PollinationApiaryBase):
    """Schema for creating a new pollination apiary"""
    pass


class PollinationApiaryUpdate(BaseModel):
    """Schema for updating a pollination apiary"""
    name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None


class PollinationApiary(PollinationApiaryBase):
    """Full pollination apiary with ID and timestamps"""
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== SENSOR DATA SCHEMAS ==========

class HiveSensorData(BaseModel):
    """Real-time sensor data for a hive"""
    hive_id: str
    hive_code: str
    status: HiveStatus
    sensors: Dict[str, Any] = Field(
        ...,
        description="Sensor readings including acoustics, temperature, humidity, flight_activity"
    )
    frames_of_bees: int
    queen_status: str = Field(..., description="present/absent/unknown")
    last_sync: str
    location: Optional[Dict[str, float]] = None  # {"lat": -1.29, "lng": 36.82}
    
    class Config:
        json_schema_extra = {
            "example": {
                "hive_id": "H-001",
                "hive_code": "H-001",
                "status": "healthy",
                "sensors": {
                    "acoustics": {"value": 235, "trend": "stable", "trendValue": "Stable"},
                    "temperature": {"value": 34.5, "trend": "stable", "trendValue": "Stable"},
                    "humidity": {"value": 65, "trend": "down", "trendValue": "-1.2%"},
                    "flight_activity": {"value": 38.5, "trend": "up", "trendValue": "+5%"}
                },
                "frames_of_bees": 8,
                "queen_status": "present",
                "last_sync": "2m ago",
                "location": {"lat": -1.2921, "lng": 36.8219}
            }
        }


# ========== ANALYTICS SCHEMAS ==========

class PollinationAnalytics(BaseModel):
    """Analytics for pollination operations"""
    total_contracts: int
    active_contracts: int
    total_hives_deployed: int
    total_acres_covered: float
    average_fpa: float
    coverage_health_percent: float
    healthy_hives: int
    warning_hives: int
    critical_hives: int
    total_revenue: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_contracts": 12,
                "active_contracts": 8,
                "total_hives_deployed": 240,
                "total_acres_covered": 1250.0,
                "average_fpa": 2.3,
                "coverage_health_percent": 95.0,
                "healthy_hives": 220,
                "warning_hives": 15,
                "critical_hives": 5,
                "total_revenue": 125000.0
            }
        }


class PollinationCalculatorInput(BaseModel):
    """Input for pollination calculator"""
    crop_type: str
    acreage: float
    avg_frames_per_hive: int = Field(8, ge=6, le=12)
    weather_factor: float = Field(0.92, ge=0.5, le=1.0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "crop_type": "Sunflower",
                "acreage": 20.0,
                "avg_frames_per_hive": 8,
                "weather_factor": 0.92
            }
        }


class PollinationCalculatorResult(BaseModel):
    """Result from pollination calculator"""
    crop_type: str
    acreage: float
    target_fpa: float
    hives_needed: int
    actual_fpa: float
    total_fpa_required: float
    coverage_health_percent: int
    foraging_efficiency_percent: int
    strength_category: str
    forage_range_km: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "crop_type": "Sunflower",
                "acreage": 20.0,
                "target_fpa": 2.0,
                "hives_needed": 6,
                "actual_fpa": 2.2,
                "total_fpa_required": 40.0,
                "coverage_health_percent": 95,
                "foraging_efficiency_percent": 88,
                "strength_category": "OPTIMAL",
                "forage_range_km": "1.5 km"
            }
        }


# ========== SPATIAL OPTIMIZATION SCHEMAS ==========

class PollinationOptimizationRequest(BaseModel):
    """Input for spatial pollination optimizer"""
    orchard_geojson: Dict[str, Any]
    hive_count: int = Field(..., gt=0)
    target_crop: str
    bee_flight_radius_km: Optional[float] = 1.5
    ahp_weights: Optional[Dict[str, float]] = None

class PollinationPlacementResult(BaseModel):
    """Output individual placement coordinate and score"""
    lat: float
    lng: float
    score: float
    coverage_radius_km: float
    metadata: Dict[str, Any]



# ========== ACTIVITY LOG SCHEMAS ==========

class PollinationActivityLog(BaseModel):
    """Activity log for pollination operations"""
    id: str
    contract_id: Optional[str] = None
    hive_id: Optional[str] = None
    activity_type: str  # deployment, removal, inspection, alert
    activity_description: str
    severity: str = "info"  # info, warning, critical, success
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


# ========== RESPONSE SCHEMAS ==========

class PollinationDashboardData(BaseModel):
    """Complete dashboard data for precision pollination"""
    contracts: List[PollinationContract]
    hive_sensor_data: List[HiveSensorData]
    analytics: PollinationAnalytics
    recent_activities: List[PollinationActivityLog]
    crop_requirements: List[CropPollinationRequirements]


# ========== DEPLOYMENTS (Tactical plans) ==========

class PollinationDeploymentBase(BaseModel):
    field_name: str
    crop_type: str
    total_acres: float
    bloom_intensity: Optional[float] = 1.0
    forage_condition: Optional[float] = 1.0
    status: Optional[str] = "active"
    metrics_json: Optional[Dict[str, Any]] = None


class PollinationDeploymentCreate(PollinationDeploymentBase):
    pass


class PollinationDeploymentUpdate(BaseModel):
    field_name: Optional[str] = None
    crop_type: Optional[str] = None
    total_acres: Optional[float] = None
    bloom_intensity: Optional[float] = None
    forage_condition: Optional[float] = None
    status: Optional[str] = None
    metrics_json: Optional[Dict[str, Any]] = None


class PollinationDeployment(PollinationDeploymentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
