
import os
import sys
from datetime import datetime, date
import uuid
import traceback

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from dotenv import load_dotenv
load_dotenv("backend/.env")

# Fallback for keys
if not os.getenv("SUPABASE_URL"):
    os.environ["SUPABASE_URL"] = os.getenv("VITE_SUPABASE_URL", "")
if not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    os.environ["SUPABASE_SERVICE_ROLE_KEY"] = os.getenv("SUPABASE_KEY", "")

from app.services import traceability_service
from app.schemas import traceability as schemas

def seed_kibwezi_data():
    try:
        print("Starting Kibwezi Full Traceability Seeding...")
        
        # 1. Register Farmer
        f_id = f"F-MAT-{str(uuid.uuid4())[:4].upper()}"
        farmer_data = {
            "farmer_id": f_id,
            "name": "Timothy Nduva",
            "registration_date": datetime.now().isoformat(),
            "experience_years": 15,
            "story": "Timothy Nduva is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production.",
            "latitude": -2.41,
            "longitude": 37.97,
            "location_name": "Kibwezi Sanctuary",
            "region": "Eastern",
            "county": "Makueni"
        }
        
        farmer_schema = schemas.FarmerCreate(**farmer_data)
        farmer_res = traceability_service.register_farmer(farmer_schema)
        print(f"Farmer registered: {farmer_data['name']} ({f_id})")

        # 2. Register Apiary
        apiary_code = f"KIB-SAV-{str(uuid.uuid4())[:3].upper()}"
        apiary_data = schemas.ApiaryCreate(
            apiary_code=apiary_code,
            name="Kibwezi Savanna Apiary",
            farmer_id=f_id,
            environment_type="Savanna Wooded",
            flora_types=["Acacia Tortilis", "Desert Date", "Wildflowers"],
            location_name="Kibwezi West",
            latitude=-2.412,
            longitude=37.975,
            region="Eastern",
            county="Makueni",
            established_date=date(2020, 5, 15)
        )
        
        apiary_res = traceability_service.register_apiary(apiary_data)
        print(f"Apiary registered: {apiary_code}")

        # 3. Register Hive
        hive_code = f"KIB-H-{str(uuid.uuid4())[:3].upper()}"
        h_id = str(uuid.uuid4())
        hive_data = schemas.HiveCreate(
            hive_id=h_id,
            hive_code=hive_code,
            apiary_id=apiary_res['apiary_id'],
            farmer_id=f_id,
            hive_type="Langstroth",
            bee_type="African Honey Bee",
            has_sensors=True,
            frame_count=10,
            material="Cedar Wood",
            installation_date=date(2020, 6, 1)
        )
        
        hive_res = traceability_service.register_hive(hive_data)
        print(f"Hive registered: {hive_code}")

        # 4. Record Harvest
        harv_id = str(uuid.uuid4())
        harvest_data = schemas.HarvestCreate(
            harvest_id=harv_id,
            hive_id=h_id,
            farmer_id=f_id,
            harvest_date=date(2024, 1, 15),
            quantity_kg=18.5,
            quantity_left_for_bees_kg=18.5,
            extraction_method="Centrifuge (Cold Extraction)",
            nectar_source="Acacia Tortilis",
            weather_conditions="Sunny, 32°C, Low Humidity",
            moisture_content_percent=17.2,
            quality_score=98
        )
        
        harvest_res = traceability_service.record_harvest(harvest_data)
        print(f"Harvest recorded: 18.5kg")

        # 5. Create Batch
        batch_code = "BC-KIB-DEMO"
        batch_data = {
            "batch_code": batch_code,
            "harvest_id": harv_id,
            "hive_id": h_id,
            "apiary_id": apiary_res['apiary_id'],
            "farmer_id": f_id,
            "honey_type": "Premium Acacia",
            "production_date": datetime.now().isoformat(),
            "expiry_date": "2026-01-15",
            "quantity_jars": 120,
            "jar_size_grams": 500,
            "total_quantity_kg": 60.0,
            "quality_grade": "Premium",
            "origin_story": "This premium acacia honey was harvested at the peak of the bloom in the Kibwezi Savanna."
        }
        
        traceability_service.create_batch(batch_data)
        print(f"Batch created: {batch_code}")

        print("Seeding Complete Successfully!")

    except Exception as e:
        print(f"Seed failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    seed_kibwezi_data()
