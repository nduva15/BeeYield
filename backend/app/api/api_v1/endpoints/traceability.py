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
    from app.db.clickhouse_db import track_traceability_scan
    
    print(f"🔍 Trace Request for Code: {code}")
    result = traceability_service.get_trace_journey(code)
    
    if result:
        print(f"✅ Found in Blockchain: {code}")
        background_tasks.add_task(track_traceability_scan, code)
        return result
        
    # Demo Fallback (if real data not found, return a rich demo response for the user to see UI)
    # Support all three demo batch codes: DEMO-001, KIB-ACACIA-24, KIB-GOLD-24
    demo_codes = ["DEMO-001", "KIB-ACACIA-24", "KIB-GOLD-24"]
    if code.upper() in demo_codes or code.upper().startswith("DEMO"):
        print(f"ℹ️ Returning Demo Data for: {code}")
        background_tasks.add_task(track_traceability_scan, code, scan_location="Demo")
        return _get_demo_trace(code.upper())
    
    background_tasks.add_task(track_traceability_scan, code)
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
    """
    Returns differentiated demo data for the three supported batch codes.
    All verified on HoneyChain™ - BeeYield's blockchain traceability platform.
    """
    from datetime import date
    
    # DEMO-001: Timothy Nduva - Kibwezi Wildflower Honey (default demo)
    if code == "DEMO-001":
        return schemas.TraceResponse(
            batch_code=code,
            product_name="Kibwezi Wildflower Honey",
            verified=True,
            blockchain_verified=True,
            verification_url="https://beeyield.com/honeychain/verify/demo-001",
            farmer=schemas.Farmer(
                farmer_id="F-MAT-001", name="Timothy Nduva", region="Kibwezi", county="Makueni",
                location_name="Kibwezi HQ", latitude=-2.41, longitude=37.97,
                story="Timothy is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production. His 15 years of experience have made him a mentor to many young beekeepers in the region.",
                experience_years=15,
                registration_date=date(2020, 5, 15)
            ),
            apiary=schemas.Apiary(
                apiary_id="A-KIB-01", apiary_code="KIB-01", name="Kibwezi Savannah Apiary",
                farmer_id="F-MAT-001", environment_type="Savannah Woodland",
                flora_types=["Acacia Tortilis", "Citrus", "Wildflowers", "Baobab"],
                location_name="Kibwezi", latitude=-2.41, longitude=37.97,
                region="Eastern", county="Makueni",
                established_date=date(2020, 5, 15)
            ),
            hive=schemas.Hive(
                hive_id="H-KIB-01-01", hive_code="KIB-01-H01", hive_type="Langstroth",
                bee_type="African Honey Bee (Apis mellifera scutellata)",
                apiary_id="A-KIB-01", farmer_id="F-MAT-001",
                installation_date=date(2020, 5, 20), has_sensors=True,
                frame_count=10, material="Cedar Wood"
            ),
            story_title="A Legacy of Conservation",
            story_content="Harvested from the diverse wildflower meadows of Kibwezi, Makueni. This honey supports local biodiversity and sustainable livelihoods. Timothy's commitment to leaving 50% of honey for the bees ensures colony health year-round.",
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
                "acoustic_health": "OPTIMAL - Healthy Queen Pattern"
            },
            timeline=[
                schemas.TraceJourneyStep(
                    title="Origin Verified", date="2024-01-10", location="Kibwezi Savannah Apiary",
                    description="Colony health confirmed via IoT sensors. Bee population: 45,000+", icon="Hexagon", data={}, hash="0xA1B2C3D4E5F6..."
                ),
                schemas.TraceJourneyStep(
                    title="Harvested", date="2024-01-15", location="Kibwezi, Makueni County",
                    description="Ethically harvested by Timothy Nduva. 15.5kg collected, 15.5kg left for bees (50/50 promise).", icon="Basket", data={}, hash="0xF6E5D4C3B2A1..."
                ),
                schemas.TraceJourneyStep(
                    title="Quality Tested", date="2024-01-17", location="BeeYield Quality Lab",
                    description="Moisture: 17.2%, Purity: 100% Raw, No additives detected.", icon="TestTube", data={}, hash="0x1234567890AB..."
                ),
                schemas.TraceJourneyStep(
                    title="Sealed on HoneyChain™", date="2024-01-20", location="BeeYield Blockchain Node",
                    description="Immutably recorded on HoneyChain™. Authenticity guaranteed forever.", icon="Shield", data={}, hash="0xDEADBEEF0001..."
                )
            ]
        )
    
    # KIB-ACACIA-24: Mary Wanjiku - Pure Acacia Honey from Kitui
    elif code == "KIB-ACACIA-24":
        return schemas.TraceResponse(
            batch_code=code,
            product_name="Pure Acacia Honey",
            verified=True,
            blockchain_verified=True,
            verification_url="https://beeyield.com/honeychain/verify/kib-acacia-24",
            farmer=schemas.Farmer(
                farmer_id="F-KIT-002", name="Mary Wanjiku", region="Kitui", county="Kitui",
                location_name="Mutomo Hills", latitude=-2.05, longitude=38.20,
                story="Mary leads a women's beekeeping cooperative in Kitui, empowering 12 women farmers. Her acacia honey is prized for its delicate flavor and slow crystallization properties.",
                experience_years=8,
                registration_date=date(2021, 3, 8)
            ),
            apiary=schemas.Apiary(
                apiary_id="A-KIT-02", apiary_code="KIT-02", name="Mutomo Acacia Reserve",
                farmer_id="F-KIT-002", environment_type="Acacia Woodland",
                flora_types=["Acacia senegal", "Acacia seyal", "Desert Rose"],
                location_name="Mutomo", latitude=-2.05, longitude=38.20,
                region="Eastern", county="Kitui",
                established_date=date(2021, 3, 15)
            ),
            hive=schemas.Hive(
                hive_id="H-KIT-02-05", hive_code="KIT-02-H05", hive_type="Kenya Top Bar",
                bee_type="African Honey Bee (Apis mellifera scutellata)",
                apiary_id="A-KIT-02", farmer_id="F-KIT-002",
                installation_date=date(2021, 4, 1), has_sensors=True,
                frame_count=24, material="Local Hardwood"
            ),
            story_title="Empowering Women Through Bees",
            story_content="This acacia honey comes from the Mutomo Women's Cooperative in Kitui. Each jar supports 12 women farmers and their families, providing sustainable income in a semi-arid region. The acacia trees thrive here, producing honey with a distinctive light color and mild taste.",
            impact_stats={
                "acres_pollinated": "40+ Acres",
                "beekeepers": "12 Women Farmers",
                "families_supported": "48",
                "farmer_fair_pay": "100%"
            },
            sensor_snapshot={
                "avg_temp": 35.1,
                "avg_humidity": 48,
                "weight_kg": 38.7,
                "acoustic_health": "OPTIMAL - Strong Foraging Activity"
            },
            timeline=[
                schemas.TraceJourneyStep(
                    title="Origin Verified", date="2024-02-01", location="Mutomo Acacia Reserve",
                    description="Colony strength verified. Acacia bloom peak season confirmed.", icon="Hexagon", data={}, hash="0xACAC1A2024B1..."
                ),
                schemas.TraceJourneyStep(
                    title="Harvested", date="2024-02-12", location="Mutomo, Kitui County",
                    description="Cooperative harvest by 4 women farmers. 22kg collected, 22kg left for bees.", icon="Basket", data={}, hash="0xACAC1A2024B2..."
                ),
                schemas.TraceJourneyStep(
                    title="Quality Tested", date="2024-02-14", location="BeeYield Quality Lab",
                    description="Moisture: 16.8%, Color: Light Amber, Crystallization Rate: Low.", icon="TestTube", data={}, hash="0xACAC1A2024B3..."
                ),
                schemas.TraceJourneyStep(
                    title="Sealed on HoneyChain™", date="2024-02-18", location="BeeYield Blockchain Node",
                    description="Permanently recorded on HoneyChain™ blockchain. Verified authentic.", icon="Shield", data={}, hash="0xACAC1A2024B4..."
                )
            ]
        )
    
    # KIB-GOLD-24: Joseph Mutua - Premium Golden Honey from Mwingi
    else:  # KIB-GOLD-24 or any other code
        return schemas.TraceResponse(
            batch_code=code if code in ["KIB-GOLD-24"] else "KIB-GOLD-24",
            product_name="Premium Golden Honey",
            verified=True,
            blockchain_verified=True,
            verification_url="https://beeyield.com/honeychain/verify/kib-gold-24",
            farmer=schemas.Farmer(
                farmer_id="F-MWI-003", name="Joseph Mutua", region="Mwingi", county="Kitui",
                location_name="Mwingi Central", latitude=-0.93, longitude=38.06,
                story="Joseph is a third-generation beekeeper whose family has maintained hives in Mwingi for over 60 years. His golden honey is legendary in the region, known for its rich amber color and complex floral notes.",
                experience_years=25,
                registration_date=date(2019, 11, 1)
            ),
            apiary=schemas.Apiary(
                apiary_id="A-MWI-03", apiary_code="MWI-03", name="Mutua Family Apiary",
                farmer_id="F-MWI-003", environment_type="Mixed Savannah Forest",
                flora_types=["Croton", "Calotropis", "Acacia mellifera", "Wild Mango"],
                location_name="Mwingi Central", latitude=-0.93, longitude=38.06,
                region="Eastern", county="Kitui",
                established_date=date(1965, 1, 1)  # Family heritage
            ),
            hive=schemas.Hive(
                hive_id="H-MWI-03-12", hive_code="MWI-03-H12", hive_type="Traditional Log Hive",
                bee_type="African Honey Bee (Apis mellifera scutellata)",
                apiary_id="A-MWI-03", farmer_id="F-MWI-003",
                installation_date=date(2019, 12, 15), has_sensors=True,
                frame_count=0, material="Hollow Mango Log (Traditional)"
            ),
            story_title="Three Generations of Beekeeping",
            story_content="The Mutua family has been keeping bees in Mwingi since 1965. Joseph's grandfather started with traditional log hives, and today Joseph combines ancestral knowledge with modern IoT monitoring. This golden honey represents the best of tradition and technology.",
            impact_stats={
                "acres_pollinated": "100+ Acres",
                "beekeepers": "1 Master + 3 Apprentices",
                "heritage_years": "60+",
                "farmer_fair_pay": "100%"
            },
            sensor_snapshot={
                "avg_temp": 33.8,
                "avg_humidity": 55,
                "weight_kg": 52.3,
                "acoustic_health": "EXCELLENT - Peak Production"
            },
            timeline=[
                schemas.TraceJourneyStep(
                    title="Heritage Site Verified", date="2024-03-01", location="Mutua Family Apiary, Mwingi",
                    description="60-year heritage apiary confirmed. Multi-generation bee genetics preserved.", icon="Hexagon", data={}, hash="0xG0LD24000001..."
                ),
                schemas.TraceJourneyStep(
                    title="Harvested", date="2024-03-15", location="Mwingi Central, Kitui County",
                    description="Traditional harvest by Joseph and 2 sons. 28kg collected, 28kg left for bees.", icon="Basket", data={}, hash="0xG0LD24000002..."
                ),
                schemas.TraceJourneyStep(
                    title="Quality Tested", date="2024-03-17", location="BeeYield Quality Lab",
                    description="Moisture: 17.5%, Color: Rich Golden Amber, Enzyme Activity: Very High.", icon="TestTube", data={}, hash="0xG0LD24000003..."
                ),
                schemas.TraceJourneyStep(
                    title="Sealed on HoneyChain™", date="2024-03-20", location="BeeYield Blockchain Node",
                    description="Immutably sealed on HoneyChain™. Heritage batch certified authentic.", icon="Shield", data={}, hash="0xG0LD24000004..."
                )
            ]
        )

