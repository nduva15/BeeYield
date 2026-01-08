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
    print("👨‍🌾 Registering Farmer: Timothy Nduva...")
    farmer = schemas.FarmerCreate(
        name="Timothy Nduva",
        phone="+254 700 000 000",
        experience_years=8,
        story="Timothy is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production.",
        location_name="Kibwezi HQ",
        region="Kibwezi",
        county="Makueni",
        latitude=-2.41,
        longitude=37.97
    )
    farmer_data = traceability_service.register_farmer(farmer)
    farmer_id = farmer_data['farmer_id']

    # 2. Register an Apiary
    print("🏡 Registering Apiary: Kibwezi Savannah Apiary...")
    apiary = schemas.ApiaryCreate(
        apiary_code="KIB-01",
        name="Kibwezi Savannah Apiary",
        environment_type="Savannah Wooded",
        flora_types=["Acacia Tortilis", "Citrus", "Wildflowers"],
        water_source="Natural Spring Water",
        farmer_id=farmer_id,
        location_name="Kibwezi",
        region="Eastern",
        county="Makueni",
        latitude=-2.41,
        longitude=37.97
    )
    apiary_data = traceability_service.register_apiary(apiary)
    apiary_id = apiary_data['apiary_id']

    # 3. Register a Hive
    print("🐝 Registering Hive: KIB-01-H01...")
    hive = schemas.HiveCreate(
        hive_code="KIB-01-H01",
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
        quantity_kg=15.5,
        quantity_left_for_bees_kg=15.5,  # 50/50 split
        extraction_method="Cold Centrifuge",
        nectar_source="Acacia Tortilis",
        weather_conditions="Sunny & Dry",
        moisture_content_percent=17.2
    )
    harvest_data = traceability_service.record_harvest(harvest)
    harvest_id = harvest_data['harvest_id']

    # 6. Create Product Batch
    print("📦 Creating Batch: DEMO-001...")
    batch_data = {
        "batch_code": "DEMO-001",
        "honey_type": "Wildflower",
        "harvest_id": harvest_id,
        "processing_id": "PROC-" + harvest_id[:8].upper(),
        "production_date": datetime.now().isoformat(),
        "apiary_code": "KIB-01",
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
