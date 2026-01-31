import os
import sys
import uuid
import random
import json
import traceback
from datetime import datetime, date, timedelta

# Add backend to path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from supabase import create_client

from app.blockchain.honey_chain import HoneyBlockchain
from app.blockchain.honey_block import BlockType
from app.schemas import traceability as schemas

# Set encoding for Windows stdout
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def cleanup():
    print("--- 1. Cleaning Up ---")
    # 1. Clear Blockchain file
    chain_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "blockchain", "traceability_chain.json")
    if os.path.exists(chain_path):
        try:
            os.remove(chain_path)
            print(f"[OK] Deleted blockchain file at {chain_path}")
        except:
            print(f"[ERROR] Could not delete blockchain file. It might be in use.")

    # 2. Clear Supabase Tables
    tables = [
        "blockchain_records", "honey_batches", "batches", "processing_records",
        "harvests", "flower_sources", "colonies", "hives", "apiaries", "farmers"
    ]
    for table in tables:
        try:
            supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"[OK] Cleared Supabase table: {table}")
        except Exception as e:
            print(f"[WARN] Could not clear {table}: {e}")

def seed():
    try:
        print("\n--- 2. Initializing New HoneyChain ---")
        blockchain = HoneyBlockchain(difficulty=1, auto_mine=True)
        
        # --- entities ---
        print("\n--- 3. Seeding Timothy Nduva ---")
        f_id = "F-NDUVA-001"
        f_uuid = str(uuid.uuid4())
        farmer_data = {
            "id": f_uuid,
            "farmer_id": f_id,
            "name": "Timothy Nduva",
            "phone": "+254700000001",
            "experience_years": 6,
            "story": 'Timothy Nduva started in 2020 with just 4 hives. Through dedication to the "50/50 Harvest Promise" (taking only half, leaving half for the bees), he has scaled to 184 hives on a 5-acre fenced apiary. He has planted over 2500 trees to support the local biome, creating a true sanctuary for bees in Kibwezi.',
            "latitude": -2.41,
            "longitude": 37.97,
            "location_name": "Kibwezi",
            "region": "Eastern",
            "county": "Makueni",
            "certification_status": "CERTIFIED",
            "total_hives": 184,
            "registration_date": "2020-01-15T00:00:00Z"
        }
        
        f_block = blockchain.register_farmer(farmer_data)
        farmer_data["blockchain_hash"] = f_block.hash
        supabase.table("farmers").insert(farmer_data).execute()
        print(f"[OK] Farmer registered: {farmer_data['name']}")

        print("\n--- 4. Seeding Kibwezi Main Apiary ---")
        a_id = "A-KIB-001"
        a_uuid = str(uuid.uuid4())
        apiary_data = {
            "id": a_uuid,
            "apiary_id": a_id,
            "apiary_code": "KIB-001",
            "name": "Kibwezi Main Apiary",
            "farmer_id": f_uuid,
            "environment_type": "Savannah Woodland (Re-forested)",
            "flora_types": ['Acacia', 'Baobab', 'Sisal', 'Sunflower', 'Mangoes', 'Indigenous Trees'],
            "water_source": "Seasonal River",
            "sun_exposure": "Full Sun",
            "latitude": -2.41,
            "longitude": 37.97,
            "location_name": "Kibwezi",
            "region": "Eastern",
            "county": "Makueni",
            "hive_count": 184,
            "established_date": "2020-01-15",
            "is_active": True,
            "description": '5-acre fenced sanctuary with over 2500 planted trees. Scaled from 4 hives in 2020 to 184 hives today.'
        }
        a_block = blockchain.register_apiary(apiary_data)
        apiary_data["blockchain_hash"] = a_block.hash
        supabase.table("apiaries").insert(apiary_data).execute()
        print(f"[OK] Apiary registered: {apiary_data['name']}")

        print("\n--- 5. Seeding 184 Hives ---")
        hives_map = {}
        h_to_supabase = []
        for i in range(1, 185):
            h_code = f"KIB-H{i:03d}"
            h_uuid = str(uuid.uuid4())
            h_type = "Langstroth" if i <= 40 else "Traditional Log"
            h_data = {
                "id": h_uuid,
                "hive_id": h_uuid,
                "hive_code": h_code,
                "apiary_id": a_uuid,
                "farmer_id": f_uuid,
                "hive_type": h_type,
                "bee_type": "African Honey Bee (Apis mellifera scutellata)",
                "frame_count": 10 if i <= 40 else 0,
                "material": "Cedar Wood" if i <= 40 else "Hollow Mango Log",
                "installation_date": "2024-01-15",
                "has_sensors": i <= 15,
                "status": "ACTIVE"
            }
            h_block = blockchain.register_hive(h_data)
            h_data["blockchain_hash"] = h_block.hash
            h_to_supabase.append(h_data)
            hives_map[h_code] = h_uuid
            
            if i % 50 == 0:
                print(f" Inserting hives {i-49} to {i}...")
                supabase.table("hives").insert(h_to_supabase).execute()
                h_to_supabase = []
        
        if h_to_supabase:
            supabase.table("hives").insert(h_to_supabase).execute()
        print("[OK] Hives completed.")

        print("\n--- 6. Seeding Granular Batches for 15 Hives ---")
        for i in range(1, 16):
            h_code = f"KIB-H{i:03d}"
            h_uuid = hives_map[h_code]
            
            # 6a. Sensor Data
            sensor_data = {
                "hive_id": h_uuid,
                "temperature": 34.0 + random.uniform(0.1, 0.8),
                "humidity": 50.0 + random.uniform(1.0, 5.0),
                "weight": 40.0 + random.uniform(2.0, 5.0),
                "acoustic_frequency": "OPTIMAL - Healthy Queen Pattern",
                "timestamp": (datetime.now() - timedelta(days=2)).isoformat()
            }
            blockchain.record_sensor_data(sensor_data)
            
            # 6b. Harvest
            harv_uuid = str(uuid.uuid4())
            harv_date_obj = date(2026, 1, 3 + (i % 7))
            harv_data = {
                "id": harv_uuid,
                "harvest_id": harv_uuid,
                "hive_id": h_uuid,
                "farmer_id": f_uuid,
                "harvester_name": "Timothy Nduva",
                "harvest_date": harv_date_obj.isoformat(),
                "quantity_kg": 4.0,
                "quantity_left_for_bees_kg": 4.0,
                "extraction_method": "Cold Extraction",
                "nectar_source": "Acacia/Sunflower/Indigenous Trees",
                "weather_conditions": "Sunny",
                "moisture_content_percent": 17.2 + random.uniform(0.1, 0.3)
            }
            harv_block = blockchain.record_harvest(harv_data)
            harv_data["blockchain_hash"] = harv_block.hash
            supabase.table("harvests").insert(harv_data).execute()
            
            # 6c. Processing
            proc_uuid = str(uuid.uuid4())
            proc_date_obj = date(2026, 1, 12)
            proc_data = {
                "id": proc_uuid,
                "harvest_id": harv_uuid,
                "processing_date": proc_date_obj.isoformat(),
                "processor_name": "BeeYield Central Processing",
                "facility_location": "Makueni Facility",
                "processing_method": "Cold Extraction",
                "filtering_method": "Coarse Mesh Filter (200 micron)",
                "moisture_content_percent": harv_data["moisture_content_percent"],
                "is_raw": True,
                "quality_grade": "Premium"
            }
            proc_block = blockchain.record_processing(proc_data)
            proc_data["blockchain_hash"] = proc_block.hash
            supabase.table("processing_records").insert(proc_data).execute()
            
            # 6d. Batch
            batch_id = str(uuid.uuid4())
            batch_code = f"KIB-{h_code}-0126"
            batch_data = {
                "id": batch_id,
                "batch_id": batch_id,
                "batch_code": batch_code,
                "processing_id": proc_uuid,
                "harvest_id": harv_uuid,
                "hive_id": h_uuid,
                "apiary_id": a_uuid,
                "farmer_id": f_uuid,
                "honey_type": "Wildflower Multi-floral",
                "quantity_kg": 4.0,
                "jar_count": 8,
                "jar_size_ml": 500,
                "production_date": "2026-01-15T12:00:00Z",
                "best_before": "2028-01-15T12:00:00Z",
                "origin_story": f"Exclusive single-hive collection from {h_code} at our Kibwezi sanctuary. Every drop reflects the unique forage and care of this specific colony.",
                "environment": "5 Acres Fenced, 2500+ Trees Planted",
                "qty_left_for_bees": "4kg Left (50/50 Promise)",
                "sustainability": "Verified Reforestation & Ethical Harvest"
            }
            batch_block = blockchain.create_batch(batch_data)
            
            # Supabase
            s_batch = {
                "id": batch_id,
                "batch_code": batch_code,
                "processing_id": proc_uuid,
                "packaging_date": "2026-01-15",
                "expiry_date": "2028-01-15",
                "quantity_jars": 8,
                "jar_size_grams": 500,
                "blockchain_hash": batch_block.hash
            }
            supabase.table("batches").insert(s_batch).execute()
            
            h_batch = {
                "batch_code": batch_code,
                "honey_type": "Kibwezi Single-Hive Raw",
                "harvest_date": harv_date_obj.isoformat(),
                "packaged_date": "2026-01-15",
                "quantity_kg": 4.0,
                "processing_method": "Cold Extraction - Raw",
                "farmer_name": "Timothy Nduva",
                "location_county": "Makueni",
                "location_region": "Kibwezi",
                "latitude": -2.41,
                "longitude": 37.97,
                "quality_grade": "Premium",
                "certifications": ['Organic', 'Fair Trade', 'KEBS Certified'],
                "moisture_content": harv_data["moisture_content_percent"],
                "status": "verified",
                "blockchain_hash": batch_block.hash
            }
            try:
                supabase.table("honey_batches").insert(h_batch).execute()
            except:
                pass
            
            print(f" [OK] Created Batch: {batch_code}")

        print("\n[OK] SEEDING COMPLETE")
    except Exception as e:
        print("\n[ERROR] DURING SEEDING")
        traceback.print_exc()

if __name__ == "__main__":
    cleanup()
    seed()
