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
async def get_trace_by_code(code: str, request: Request):
    """
    Public endpoint to trace honey by its batch code (e.g. from jar).
    Returns full journey: Farmer -> Apiary -> Hive -> Harvest -> Processing.
    """
    result = traceability_service.get_trace_journey(code)
    
    if result:
        return result
        
    # Demo Fallback (if real data not found, return a rich demo response for the user to see UI)
    if code.startswith("DEMO"):
        return _get_demo_trace(code)
    
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
    
    # Mock data for demonstration
    return schemas.TraceResponse(
        batch_code=code,
        product_name="Premium Acacia Honey",
        verified=True,
        blockchain_verified=True,
        verification_url="https://beeyield.co.ke/verify/demo",
        farmer=schemas.Farmer(
            farmer_id="F-DEMO", name="John Kamau", region="Nyeri", county="Nyeri",
            location_name="Nyeri", latitude=-0.416, longitude=36.95,
            story="John has been beekeeping for 20 years in the foothills of Mt. Kenya.",
            registration_date=date.today()
        ),
        apiary=schemas.Apiary(
            apiary_id="A-DEMO", apiary_code="NYR-01", name="Mt Kenya Forest Edge",
            farmer_id="F-DEMO", environment_type="Highland Forest",
            flora_types=["Acacia", "Croton"], location_name="Forest Edge",
            latitude=-0.416, longitude=36.95, region="Central", county="Nyeri",
            established_date=date(2020, 1, 1)
        ),
        hive=schemas.Hive(
            hive_id="H-DEMO", hive_code="NYR-01-H05", hive_type="Langstroth",
            bee_type="African Honey Bee", apiary_id="A-DEMO", farmer_id="F-DEMO",
            installation_date=date(2021, 5, 20), has_sensors=True
        ),
        story_title="A Tradition of Excellence",
        story_content="Harvested from the pristine forests of Mount Kenya, this honey represents the perfect harmony between nature and sustainable farming.",
        impact_stats={"farmers": 1, "bees": 50000, "biodiversity": "Preserved"},
        sensor_snapshot={
            "avg_temp": 34.2,
            "avg_humidity": 52,
            "weight_kg": 42.5,
            "acoustic_health": "OPTIMAL"
        },
        timeline=[
            schemas.TraceJourneyStep(
                title="Harvested", date="2024-01-15", location="Nyeri", 
                description="Harvested with care. 12kg collected.", icon="Basket", data={}
            ),
             schemas.TraceJourneyStep(
                title="Processed", date="2024-01-18", location="Nairobi", 
                description="Cold filtered to preserve enzymes.", icon="Factory", data={}
            )
        ]
    )

