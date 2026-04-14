from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import date, datetime

# --- Shared ---
class BlockchainRecordBase(BaseModel):
    block_index: Optional[int] = None
    hash: Optional[str] = None
    timestamp: Optional[datetime] = None
    blockchain_verified: bool = False

class LocationBase(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    region: Optional[str] = None
    county: Optional[str] = None
    ward: Optional[str] = None

# --- Farmer / Beekeeper ---
class FarmerBase(BaseModel):
    name: str = Field(..., description="Full name of the beekeeper/farmer")
    phone: Optional[str] = None
    id_number: Optional[str] = Field(None, description="National ID or Farmer ID header")
    experience_years: int = 0
    story: Optional[str] = Field(None, description="The beekeeper's personal story")

class FarmerCreate(FarmerBase, LocationBase):
    pass

class Farmer(FarmerCreate):
    farmer_id: Optional[str] = None
    registration_date: Optional[datetime] = None
    certification_status: str = "PENDING"  # PENDING, CERTIFIED, REJECTED
    total_hives: int = 0

# --- Apiary (Bee Yard) ---
class ApiaryBase(BaseModel):
    apiary_code: str = Field(..., description="Unique code e.g. NYR-001")
    name: str
    environment_type: str = Field(..., description="E.g. Forest, Savannah, Acacia Farm")
    flora_types: list[str] = Field(default=[], description="Predominant flowers nearby")
    water_source: Optional[str] = None
    sun_exposure: str = "Full Sun"
    
class ApiaryCreate(ApiaryBase, LocationBase):
    farmer_id: str
    
class Apiary(ApiaryCreate):
    apiary_id: Optional[str] = None
    established_date: Optional[date] = None
    hive_count: int = 0

# --- Hive ---
class HiveBase(BaseModel):
    hive_code: str
    hive_type: str = Field(..., description="Langstroth, Top Bar, Traditional Log")
    bee_type: str = Field(..., description="E.g. Apis mellifera scutellata (African Honey Bee)")
    queen_type: Optional[str] = None
    frame_count: int = 0
    material: str = "Wood"

class HiveCreate(HiveBase):
    apiary_id: str
    farmer_id: str
    has_sensors: bool = False
    installation_date: date

class Hive(HiveCreate):
    hive_id: Optional[str] = None
    status: str = "ACTIVE"
    last_inspection: Optional[date] = None

# --- IoT Sensor Data ---
class HiveSensorData(BaseModel):
    hive_id: str
    temperature_celsius: float
    humidity_percent: float
    weight_kg: float
    sound_level_db: float
    frequency_hz: Optional[float] = None
    battery_level: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- Harvest ---
class HarvestCreate(BaseModel):
    hive_id: Optional[str] = None
    farmer_id: Optional[str] = None
    apiary_id: Optional[str] = None
    harvest_date: date
    quantity_kg: float
    quantity_left_for_bees_kg: Optional[float] = None
    extraction_method: str = "Cold Extraction"
    nectar_source: Optional[str] = None
    weather_conditions: Optional[str] = None
    moisture_content_percent: Optional[float] = None
    batch_code: Optional[str] = None
    honey_type: Optional[str] = None
    florage_type: Optional[str] = None
    color_grade: Optional[str] = None
    is_verified: bool = True

class Harvest(HarvestCreate):
    harvest_id: str
    harvest_code: Optional[str] = None
    quality_score: Optional[int] = None
    blockchain_hash: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Traceability Journey Response ---
class TraceJourneyStep(BaseModel):
    title: str
    date: str
    location: str
    description: str
    icon: str  # Icon name for frontend
    data: dict[str, Any]
    hash: Optional[str] = None

class TraceResponse(BaseModel):
    batch_code: str
    product_name: str
    harvest_date: Optional[str] = None
    quantity_kg: Optional[float] = None
    quantity_left_for_bees_kg: Optional[float] = None
    extraction_method: Optional[str] = None
    nectar_source: Optional[str] = None
    weather_conditions: Optional[str] = None
    moisture_content_percent: Optional[float] = None
    verified: bool
    blockchain_verified: bool
    verification_url: str
    verification_status: Optional[str] = None
    blockchain_status: Optional[dict[str, Any]] = None
    completeness: Optional[dict[str, Any]] = None
    sustainability: Optional[dict[str, Any]] = None
    
    # Entities
    farmer: Optional[Farmer] = None
    apiary: Optional[Apiary] = None
    hive: Optional[Hive] = None
    
    # Story
    story_title: str
    story_content: str
    
    # Stats / Impact
    impact_stats: dict[str, Any]
    
    # Sensor Snapshot (at harvest time or realtime)
    sensor_snapshot: Optional[dict[str, Any]] = None
    
    # Health Snapshot
    health_snapshot: Optional[dict[str, Any]] = None
    florage_type: Optional[str] = None
    
    # Extra Details
    extra_metadata: Optional[dict[str, Any]] = None
    
    # Full Journey
    timeline: list[TraceJourneyStep]

