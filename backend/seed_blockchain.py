"""
Seeding Script for BeeYield HoneyChain Blockchain
Populates the blockchain with high-quality demo data for the Traceability system.
"""
from datetime import datetime, timedelta
import sys
import os

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.blockchain.honey_chain import honey_blockchain
from app.services import traceability_service
from app.schemas import traceability as schemas

def seed_demo_data():
    print("🐝 Seeding HoneyChain with premium demo data...")

    # 1. Register a Farmer
    print("👨‍🌾 Registering Farmer: John Kamau...")
    farmer = schemas.FarmerCreate(
        name="John Kamau",
        phone="+254 712 345 678",
        experience_years=15,
        story="John has been beekeeping in the foothills of Mt. Kenya for over a decade. He is a champion for organic practices and leads a local cooperative of 20 young beekeepers.",
        location_name="Nyeri Orchard",
        region="Central",
        county="Nyeri",
        latitude=-0.4264,
        longitude=36.9476
    )
    farmer_data = traceability_service.register_farmer(farmer)
    farmer_id = farmer_data['farmer_id']

    # 2. Register an Apiary
    print("🏡 Registering Apiary: Mt. Kenya Highland Grove...")
    apiary = schemas.ApiaryCreate(
        apiary_code="MK-NY-01",
        name="Mt. Kenya Highland Grove",
        environment_type="Indigineous Forest Edge",
        flora_types=["Acacia", "Croton", "Wild Jasmine"],
        water_source="Chania River Stream",
        farmer_id=farmer_id,
        location_name="Nyeri Forest Edge",
        region="Central",
        county="Nyeri",
        latitude=-0.4300,
        longitude=36.9500
    )
    apiary_data = traceability_service.register_apiary(apiary)
    apiary_id = apiary_data['apiary_id']

    # 3. Register a Hive
    print("🐝 Registering Hive: MK-01-H05...")
    hive = schemas.HiveCreate(
        hive_code="MK-01-H05",
        hive_type="Langstroth Precision Hive",
        bee_type="African Honey Bee (Apis mellifera scutellata)",
        apiary_id=apiary_id,
        farmer_id=farmer_id,
        has_sensors=True,
        installation_date=(datetime.now() - timedelta(days=400)).date(),
        frame_count=10,
        material="Seasoned Cedar Wood"
    )
    hive_data = traceability_service.register_hive(hive)
    hive_id = hive_data['hive_id']

    # 4. Record recent Sensor Data
    print("📡 Recording IoT Sensor Data...")
    sensor_reading = schemas.HiveSensorData(
        hive_id=hive_id,
        temperature_celsius=34.5,
        humidity_percent=55.0,
        weight_kg=42.8,
        sound_level_db=68.2,
        battery_level=92.0
    )
    traceability_service.record_sensor_data(sensor_reading)

    # 5. Record a Harvest
    print("🍯 Recording Harvest: Summer Acacia Bloom...")
    harvest = schemas.HarvestCreate(
        hive_id=hive_id,
        farmer_id=farmer_id,
        harvest_date=(datetime.now() - timedelta(days=10)).date(),
        quantity_kg=12.5,
        quantity_left_for_bees_kg=12.5,  # 50/50 split
        extraction_method="Cold Centrifuge",
        nectar_source="Highland Acacia",
        weather_conditions="Sunny & Dry",
        moisture_content_percent=17.2
    )
    harvest_data = traceability_service.record_harvest(harvest)
    harvest_id = harvest_data['harvest_id']

    # 6. Create Product Batch
    print("📦 Creating Batch: DEMO-001...")
    batch_data = {
        "batch_code": "DEMO-001",
        "honey_type": "Acacia",
        "harvest_id": harvest_id,
        "processing_id": "PROC-" + harvest_id[:8].upper(),
        "production_date": datetime.now().isoformat(),
        "apiary_code": "MK-NY-01",
        "created_by": "SYSTEM"
    }
    traceability_service.create_batch(batch_data)

    print("\n✅ HoneyChain Seeded Successfully!")
    print(f"Batch DEMO-001 is now traceable on the blockchain.")
    
    # Print stats
    stats = honey_blockchain.get_chain_stats()
    print(f"Total Blocks: {stats['total_blocks']}")
    print(f"Chain Integrity: {'VALID' if stats['chain_valid'] else 'INVALID'}")

if __name__ == "__main__":
    seed_demo_data()
