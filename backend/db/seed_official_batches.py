
import os
import sys
from datetime import datetime, date, timedelta
import uuid
import traceback

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from dotenv import load_dotenv
load_dotenv("backend/.env")

from app.services import traceability_service
from app.schemas import traceability as schemas
from app.blockchain.honey_chain import honey_blockchain, BlockType

def seed_official_data():
    try:
        print("🌱 Seeding Official BeeYield Traceability Data...")
        
        # 1. Register Timothy Nduva
        f_id = "F-TIM-NDUVA-001"
        farmer_data = {
            "farmer_id": f_id,
            "name": "Timothy Nduva",
            "experience_years": 15,
            "story": "A Strathmore University student who turned 4 beehives on half an acre into a family mission for sustainable pollination in Kibwezi.",
            "latitude": -2.41,
            "longitude": 37.97,
            "location_name": "Kibwezi Sanctuary",
            "region": "Eastern",
            "county": "Makueni"
        }
        try:
            traceability_service.register_farmer(schemas.FarmerCreate(**farmer_data))
        except: pass

        # 2. Register Apiary (The 5-Acre Main Site)
        apiary_code = "KIB-MAIN-001"
        apiary_res = traceability_service.register_apiary(schemas.ApiaryCreate(
            apiary_code=apiary_code,
            name="Kibwezi Sanctuary Apiary",
            farmer_id=f_id,
            environment_type="Savanna Wooded",
            flora_types=["Acacia Tortilis", "Citrus", "Wildflower"],
            location_name="Kibwezi West",
            latitude=-2.412,
            longitude=37.975,
            region="Eastern",
            county="Makueni",
            established_date=date(2020, 5, 15)
        ))
        # Note: In a real system we'd use the returned ID, but since this is a seed script:
        a_id = apiary_res.get('apiary_id') or "A-KIB-MAIN"

        # 3. Register a Sample Protective Hive
        h_code = "HIVE-KIB-001"
        hive_res = traceability_service.register_hive(schemas.HiveCreate(
            hive_code=h_code,
            hive_type="Langstroth Premium",
            bee_type="African Honey Bee (Apis mellifera scutellata)",
            apiary_id=a_id,
            farmer_id=f_id,
            has_sensors=True,
            installation_date=date(2023, 1, 10),
            frame_count=10,
            material="Sustainable Cedar wood"
        ))
        h_id = hive_res.get('hive_id') or "H-KIB-001"

        # 4. Record Sensor Data (The humidity and temperature)
        traceability_service.record_sensor_data(schemas.HiveSensorData(
            hive_id=h_id,
            temperature_celsius=34.8,
            humidity_percent=52.5,
            weight_kg=48.2,
            sound_level_db=62.0,
            battery_level=95.0,
            timestamp=datetime.now() - timedelta(hours=1)
        ))

        # 5. Record official Harvest
        harvest_date = (datetime.now() - timedelta(days=20)).date()
        harvest_res = traceability_service.record_harvest(schemas.HarvestCreate(
            hive_id=h_id,
            farmer_id=f_id,
            apiary_id=a_id,
            harvest_date=harvest_date,
            quantity_kg=15.0,
            quantity_left_for_bees_kg=15.0, # 50/50 Promise!
            extraction_method="Cold Extraction",
            nectar_source="Pure Acacia",
            honey_type="Premium Acacia",
            weather_conditions="Sunny & Dry",
            is_verified=True
        ))
        hrv_id = harvest_res.get('harvest_id') or "HRV-KIB-TEST"

        # 6. Create the Golden Batch
        traceability_service.create_batch({
            "batch_code": "KIB-ACACIAL-26",
            "honey_type": "Premium Acacia",
            "total_quantity_kg": 60.0,
            "quality_grade": "Grade A Premium",
            "production_date": datetime.now().isoformat(),
            "harvest_id": hrv_id,
            "farmer_id": f_id,
            "apiary_id": a_id,
            "hive_id": h_id,
            # Extra Metadata for the UI to display
            "acres_pollinated": 5,
            "trees_planted": 2500,
            "promise": "50/50 Ethical Harvest",
            "placement": "South-Facing Savanna clearing",
            "origin_story": "Sustainably harvested from our 5-acre sanctuary in Kibwezi. Born from a mission to save the African bee."
        })

        print("\n✨ Official BeeYield data seeded successfully!")

    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    seed_official_data()
