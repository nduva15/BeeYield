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
    latitude: float
    longitude: float
    location_name: str
    region: str
    county: str
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
    farmer_id: str
    registration_date: datetime
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
    apiary_id: str
    established_date: date
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
    hive_id: str
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
    verified: bool
    blockchain_verified: bool
    verification_url: str
    
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
    
    # Extra Details
    extra_metadata: Optional[dict[str, Any]] = None
    
    # Full Journey
    timeline: list[TraceJourneyStep]

