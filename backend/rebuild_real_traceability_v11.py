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

# Set encoding for Windows stdout
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def cleanup():
    print("--- 1. Cleaning Up ---")
    chain_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "blockchain", "traceability_chain.json")
    if os.path.exists(chain_path):
        try: os.remove(chain_path); print(f"[OK] Deleted blockchain file")
        except: print(f"[ERROR] Could not delete blockchain file.")

    # Table ordering matter for foreign key constraints
    tables = [
        "blockchain_records", "honey_batches", "packaged_batches", "batches", "processing_records",
        "harvests", "flower_sources", "colonies", "hives", "apiaries", "farmers"
    ]
    for table in tables:
        try:
            supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"[OK] Cleared table: {table}")
        except Exception as e:
            print(f"[WARN] Could not clear {table}: {e}")

def seed():
    try:
        print("\n--- 2. Initializing New HoneyChain ---")
        # Initialize with difficulty 1 for speed during seeding
        blockchain = HoneyBlockchain(difficulty=1, auto_mine=True)
        
        # --- Farmer ---
        print("\n--- 3. Seeding Farmer: Timothy Nduva ---")
        f_uuid = str(uuid.uuid4())
        farmer_data = {
            "id": f_uuid,
            "farmer_id": "F-NDUVA-001",
            "name": "Timothy Nduva",
            "phone": "+254700000001",
            "experience_years": 6,
            "story": 'Timothy Nduva started in 2020 with just 4 hives. Through dedication to the "50/50 Harvest Promise" (taking only half, leaving half for the bees), he has scaled to 184 hives on a 5-acre fenced apiary. He has planted over 2500 trees to support the local biome, creating a true sanctuary for bees in Kibwezi.',
            "latitude": -2.41,
            "longitude": 37.97,
            "location_name": "Kibwezi",
            "region": "Eastern",
            "county": "Makueni",
            "registration_date": "2020-01-15T12:00:00Z"
        }
        blockchain.register_farmer(farmer_data)
        farmer_data["blockchain_hash"] = blockchain.last_block.hash
        # Filter for Supabase (registration_date is TEXT in script but might need care)
        supabase.table("farmers").insert(farmer_data).execute()
        print("[OK] Farmer registered with full story.")

        # --- Apiary ---
        print("\n--- 4. Seeding Apiary: Kibwezi Main Sanctuary ---")
        a_uuid = str(uuid.uuid4())
        apiary_data = {
            "id": a_uuid,
            "apiary_id": "A-KIB-001",
            "apiary_code": "KIB-001",
            "name": "Kibwezi Main Sanctuary",
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
            "description": '5-acre fenced sanctuary with over 2500 planted trees. Scaled from 4 hives in 2020 to 184 hives today.'
        }
        blockchain.register_apiary(apiary_data)
        apiary_data["blockchain_hash"] = blockchain.last_block.hash
        supabase.table("apiaries").insert(apiary_data).execute()
        print("[OK] Apiary registered with detailed flora.")

        # --- Hives ---
        print("\n--- 5. Seeding 184 Hives ---")
        hives_map = {}
        # We'll batch insert 184 hives
        hives_to_supabase = []
        for i in range(1, 185):
            h_uuid = str(uuid.uuid4())
            h_code = f"KIB-H{i:03d}"
            h_data = {
                "id": h_uuid,
                "hive_id": h_uuid,
                "hive_code": h_code,
                "apiary_id": a_uuid,
                "farmer_id": f_uuid,
                "hive_type": "Langstroth" if i <= 40 else "Traditional Log",
                "bee_type": "African Honey Bee (Apis mellifera scutellata)",
                "material": "Cedar Wood" if i <= 40 else "Hollow Mango Log",
                "installation_date": "2024-01-15",
                "has_sensors": i <= 15,
                "status": "ACTIVE"
            }
            # Register on blockchain
            blockchain.register_hive(h_data)
            h_data["blockchain_hash"] = blockchain.last_block.hash
            
            hives_map[h_code] = h_uuid
            hives_to_supabase.append(h_data)
            
            if i % 50 == 0 or i == 184:
                supabase.table("hives").insert(hives_to_supabase).execute()
                print(f"  Inserted hives up to {h_code}")
                hives_to_supabase = []
        print("[OK] All 184 Hives registered.")

        # --- Granular Batches for the first 15 hives ---
        print("\n--- 6. Seeding Granular Batches (H001 - H015) ---")
        for i in range(1, 16):
            h_code = f"KIB-H{i:03d}"
            h_uuid = hives_map[h_code]
            
            # 6a. Record Sensor State
            sensor_data = {
                "hive_id": h_uuid,
                "temperature": 34.0 + random.uniform(0.1, 0.8),
                "humidity": 50.0 + random.uniform(1.0, 5.0),
                "weight": 40.0 + random.uniform(2.0, 5.0),
                "timestamp": (datetime.now() - timedelta(days=2)).isoformat()
            }
            blockchain.record_sensor_data(sensor_data)
            
            # 6b. Harvest
            harv_date = date(2026, 1, 3 + (i % 7))
            harv_uuid = str(uuid.uuid4())
            harv_data = {
                "id": harv_uuid,
                "harvest_id": harv_uuid,
                "hive_id": h_uuid,
                "farmer_id": f_uuid,
                "harvester_name": "Timothy Nduva",
                "harvest_date": harv_date.isoformat(),
                "quantity_kg": 4.0,
                "quantity_left_for_bees_kg": 4.0, # 50/50 Promise
                "extraction_method": "Cold Extraction",
                "nectar_source": "Acacia/Sunflower/Indigenous Trees",
                "weather_conditions": "Sunny",
                "moisture_content_percent": 17.2 + random.uniform(0.1, 0.5)
            }
            blockchain.record_harvest(harv_data)
            harv_data["blockchain_hash"] = blockchain.last_block.hash
            
            # Filter for Supabase (remove harvester_name)
            harv_db = harv_data.copy()
            harv_db.pop("harvester_name", None)
            supabase.table("harvests").insert(harv_db).execute()
            
            # 6c. Processing
            proc_uuid = str(uuid.uuid4())
            proc_date = date(2026, 1, 12)
            proc_data = {
                "id": proc_uuid,
                "harvest_id": harv_uuid,
                "processing_date": proc_date.isoformat(),
                "processor_name": "BeeYield Central Processing",
                "facility_location": "Makueni Facility",
                "filtering_method": "Coarse Mesh Filter (200 micron)",
                "moisture_content_percent": harv_data["moisture_content_percent"],
                "is_raw": True
            }
            blockchain.record_processing(proc_data)
            proc_data["blockchain_hash"] = blockchain.last_block.hash
            supabase.table("processing_records").insert(proc_data).execute()
            
            # 6d. Batch Creation
            batch_uuid = str(uuid.uuid4())
            batch_code = f"KIB-{h_code}-0126"
            batch_data = {
                "id": batch_uuid,
                "batch_id": batch_uuid,
                "batch_code": batch_code,
                "processing_id": proc_uuid,
                "harvest_id": harv_uuid,
                "hive_id": h_uuid,
                "apiary_id": a_uuid,
                "farmer_id": f_uuid,
                "honey_type": "Wildflower Multi-floral",
                "production_date": "2026-01-15T12:00:00Z",
                "origin_story": f"Timothy Nduva started in 2020 with 4 hives and scaled to 184 in Kibwezi. This jar from {h_code} follows our 50/50 harvest rule."
            }
            blockchain.create_batch(batch_data)
            b_hash = blockchain.last_block.hash
            
            # 6e. Supabase 'honey_batches' (for admin)
            h_batch = {
                "id": batch_uuid,
                "batch_code": batch_code,
                "honey_type": "Kibwezi Single-Hive Raw",
                "harvest_date": harv_data["harvest_date"],
                "packaged_date": "2026-01-15",
                "quantity_kg": 4.0,
                "processing_method": "Cold Extraction - Raw",
                "farmer_name": "Timothy Nduva",
                "apiary_name": "Kibwezi Main Sanctuary",
                "location_county": "Makueni",
                "location_region": "Kibwezi",
                "latitude": -2.41,
                "longitude": 37.97,
                "quality_grade": "Premium",
                "certifications": ['Organic', 'Fair Trade', 'KEBS Certified'],
                "moisture_content": harv_data["moisture_content_percent"],
                "status": "verified",
                "blockchain_hash": b_hash
            }
            supabase.table("honey_batches").insert(h_batch).execute()
            print(f" [OK] Created Detailed Batch: {batch_code}")

        print("\n[OK] SEEDING COMPLETE")
    except Exception as e:
        print(f"\n[ERROR]: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    cleanup()
    seed()
