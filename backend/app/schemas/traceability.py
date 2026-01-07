from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime

# --- Shared ---
class BlockchainRecordBase(BaseModel):
    block_index: Optional[int] = None
    hash: Optional[str] = None
    timestamp: Optional[datetime] = None

# --- Hive ---
class HiveBase(BaseModel):
    hive_code: str
    apiary_name: str
    location_name: str
    latitude: float
    longitude: float

class HiveCreate(HiveBase):
    environment_type: str
    hive_type: str
    installation_date: date

class Hive(HiveCreate):
    id: str # UUID
    blockchain_offset: Optional[dict] = None # Placeholder for blockchain metadata

# --- Harvest ---
class HarvestCreate(BaseModel):
    hive_id: str
    harvest_date: date
    harvester_name: str
    quantity_harvested_kg: float
    quantity_left_for_bees_kg: float # Should be 50% ideally
    extraction_method: str

class Harvest(HarvestCreate):
    id: str
    harvest_code: str

# --- Trace Response ---
# This matches the structure expected by the frontend Traceability page
class TraceResponse(BaseModel):
    batch_id: str
    verified: bool
    blockchain_verified: bool
    journey: dict
    beekeeper_story: Optional[str] = None
    impact: Optional[dict] = None
