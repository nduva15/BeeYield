"""
Traceability Endpoints - Powered by BeeYield Blockchain
"""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from typing import List, Dict, Any
from app.schemas import traceability as schemas
from app.services import traceability_service
from app.blockchain.honey_chain import honey_blockchain

router = APIRouter()

@router.get("/code/{code}", response_model=schemas.TraceResponse)
async def get_trace_by_code(code: str, request: Request, background_tasks: BackgroundTasks):
    """
    Public endpoint to trace honey by its batch code (e.g. from jar).
    Returns full journey: Farmer -> Apiary -> Hive -> Harvest -> Processing.
    """
    from app.db.clickhouse_db import ClickHouseService
    ch_service = ClickHouseService()
    
    print(f"🔍 Trace Request for Code: {code}")
    result = traceability_service.get_trace_journey(code)
    
    if result:
        print(f"✅ Found in Blockchain: {code}")
        background_tasks.add_task(ch_service.track_traceability_scan, code, True)
        return result
        
    # Demo Fallback (if real data not found, return a rich demo response for the user to see UI)
    if code.startswith("DEMO"):
        print(f"ℹ️ Returning Demo Data for: {code}")
        background_tasks.add_task(ch_service.track_traceability_scan, code, True, "Demo")
        return _get_demo_trace(code)
    
    background_tasks.add_task(ch_service.track_traceability_scan, code, False)
    print(f"❌ Code Not Found: {code}")
    raise HTTPException(status_code=404, detail=f"Traceability code '{code}' not found on the blockchain.")

@router.get("/chain", response_model=Dict[str, Any])
def get_blockchain_status():
    """
    Get current status and stats of the BeeYield Blockchain.
    Transparency endpoint.
    """
    return {
        "status": "active",
        "stats": honey_blockchain.get_chain_stats(),
        "latest_blocks": honey_blockchain.get_chain_history(limit=5)
    }

@router.post("/farmers", response_model=Dict[str, Any])
def create_farmer(farmer_in: schemas.FarmerCreate):
    """Register a new farmer/beekeeper."""
    return traceability_service.register_farmer(farmer_in)

@router.post("/apiaries", response_model=Dict[str, Any])
def create_apiary(apiary_in: schemas.ApiaryCreate):
    """Register a new apiary location."""
    return traceability_service.register_apiary(apiary_in)

@router.post("/hives", response_model=Dict[str, Any])
def create_hive(hive_in: schemas.HiveCreate):
    """Register a new hive."""
    return traceability_service.register_hive(hive_in)

@router.post("/sensors", response_model=Dict[str, Any])
def record_sensor_data(sensor_in: schemas.HiveSensorData):
    """Record IoT sensor data for a hive."""
    return traceability_service.record_sensor_data(sensor_in)

@router.post("/harvests", response_model=Dict[str, Any])
def record_harvest(harvest_in: schemas.HarvestCreate):
    """Record a harvest."""
    return traceability_service.record_harvest(harvest_in)

@router.post("/batches", response_model=Dict[str, Any])
def create_batch(batch_in: Dict[str, Any]):
    """Create a final product batch."""
    return traceability_service.create_batch(batch_in)

# --- Helper for Demo ---
def _get_demo_trace(code: str) -> schemas.TraceResponse:
    from datetime import date
    
    # Mock data for demonstration - Timothy Nduva is our main farmer in Kibwezi
    return schemas.TraceResponse(
        batch_code=code,
        product_name="Kibwezi Wildflower Honey",
        verified=True,
        blockchain_verified=True,
        verification_url="https://beeyield.com/verify/demo",
        farmer=schemas.Farmer(
            farmer_id="F-MAT-001", name="Timothy Nduva", region="Kibwezi", county="Makueni",
            location_name="Kibwezi HQ", latitude=-2.41, longitude=37.97,
            story="Timothy is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production.",
            registration_date=date(2020, 5, 15)
        ),
        apiary=schemas.Apiary(
            apiary_id="A-KIB-01", apiary_code="KIB-01", name="Kibwezi Savannah Apiary",
            farmer_id="F-MAT-001", environment_type="Savannah Wooded",
            flora_types=["Acacia Tortilis", "Citrus", "Wildflowers"], location_name="Kibwezi",
            latitude=-2.41, longitude=37.97, region="Eastern", county="Makueni",
            established_date=date(2020, 5, 15)
        ),
        hive=schemas.Hive(
            hive_id="H-KIB-01-01", hive_code="KIB-01-H01", hive_type="Langstroth",
            bee_type="African Honey Bee", apiary_id="A-KIB-01", farmer_id="F-MAT-001",
            installation_date=date(2020, 5, 20), has_sensors=True
        ),
        story_title="A Legacy of Conservation",
        story_content="Harvested from the diverse wildflower meadows of Kibwezi, Makueni. This honey supports local biodiversity and sustainable livelihoods.",
        impact_stats={
            "acres_pollinated": "25+ Acres",
            "beekeepers": "1 Master Beekeeper",
            "trees_planted": "2,500+",
            "farmer_fair_pay": "100%"
        },
        sensor_snapshot={
            "avg_temp": 34.2,
            "avg_humidity": 52,
            "weight_kg": 42.5,
            "acoustic_health": "OPTIMAL"
        },
        timeline=[
            schemas.TraceJourneyStep(
                title="Harvested", date="2024-01-15", location="Kibwezi", 
                description="Harvested with care. 15.5kg collected.", icon="Basket", data={}
            ),
             schemas.TraceJourneyStep(
                title="Processed", date="2024-01-18", location="Kibwezi HQ", 
                description="Cold filtered to preserve enzymes.", icon="Factory", data={}
            ),
            schemas.TraceJourneyStep(
                title="Verified", date="2024-01-20", location="Blockchain Node", 
                description="Quality verified and hashed to HoneyChain™.", icon="Shield", data={}
            )
        ]
    )

