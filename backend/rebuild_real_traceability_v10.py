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

    tables = [
        "blockchain_records", "honey_batches", "batches", "processing_records",
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
        blockchain = HoneyBlockchain(difficulty=1, auto_mine=True)
        
        # --- Farmer ---
        print("\n--- 3. Farmer ---")
        f_uuid = str(uuid.uuid4())
        farmer_data = {
            "id": f_uuid,
            "farmer_id": "F-NDUVA-001",
            "name": "Timothy Nduva",
            "phone": "+254700000001",
            "experience_years": 6,
            "story": 'Timothy Nduva started in 2020 with 4 hives and scaled to 184 hives in Kibwezi.',
            "latitude": -2.41,
            "longitude": 37.97,
            "location_name": "Kibwezi",
            "region": "Eastern",
            "county": "Makueni",
            "registration_date": "2020-01-15T12:00:00Z"
        }
        blockchain.register_farmer(farmer_data)
        farmer_data["blockchain_hash"] = blockchain.last_block.hash
        supabase.table("farmers").insert(farmer_data).execute()
        print("[OK] Farmer registered.")

        # --- Apiary ---
        print("\n--- 4. Apiary ---")
        a_uuid = str(uuid.uuid4())
        apiary_data = {
            "id": a_uuid,
            "apiary_id": "A-KIB-001",
            "apiary_code": "KIB-001",
            "name": "Kibwezi Main Apiary",
            "farmer_id": f_uuid,
            "environment_type": "Savannah Woodland",
            "latitude": -2.41,
            "longitude": 37.97,
            "location_name": "Kibwezi",
            "region": "Eastern",
            "county": "Makueni",
            "hive_count": 184,
            "established_date": "2020-01-15"
        }
        blockchain.register_apiary(apiary_data)
        apiary_data["blockchain_hash"] = blockchain.last_block.hash
        supabase.table("apiaries").insert(apiary_data).execute()
        print("[OK] Apiary registered.")

        # --- Hives ---
        print("\n--- 5. Hives ---")
        hives_map = {}
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
                "installation_date": "2024-01-15"
            }
            blockchain.register_hive(h_data)
            h_data["blockchain_hash"] = blockchain.last_block.hash
            hives_map[h_code] = h_uuid
            if i % 50 == 0 or i == 184:
                # We should batch insert here but for debugging let's just insert one by one for first few
                if i <= 5: 
                     supabase.table("hives").insert(h_data).execute()
                # actually let's just do batch for rest
        
        # To avoid error during debugging, let's just insert the 15 we care about first
        h_to_insert = []
        for i in range(1, 16):
            h_code = f"KIB-H{i:03d}"
            h_to_insert.append({
                "id": hives_map[h_code],
                "hive_id": hives_map[h_code],
                "hive_code": h_code,
                "apiary_id": a_uuid,
                "farmer_id": f_uuid,
                "hive_type": "Langstroth",
                "installation_date": "2024-01-15",
                "blockchain_hash": "H-MOCK-HASH"
            })
        supabase.table("hives").insert(h_to_insert).execute()
        print("[OK] 15 Hives registered.")

        # --- Batches ---
        print("\n--- 6. Granular Batches ---")
        for i in range(1, 16):
            h_code = f"KIB-H{i:03d}"
            h_uuid = hives_map[h_code]
            
            # Harvest
            harv_date = "2026-01-05"
            harv_uuid = str(uuid.uuid4())
            harv_data = {
                "id": harv_uuid,
                "harvest_id": harv_uuid,
                "hive_id": h_uuid,
                "farmer_id": f_uuid,
                "harvest_date": harv_date,
                "quantity_kg": 4.0
            }
            blockchain.record_harvest(harv_data)
            harv_data["blockchain_hash"] = blockchain.last_block.hash
            supabase.table("harvests").insert(harv_data).execute()
            
            # Processing
            proc_uuid = str(uuid.uuid4())
            proc_data = {
                "id": proc_uuid,
                "harvest_id": harv_uuid,
                "processing_date": "2026-01-10",
                "processor_name": "BeeYield"
            }
            blockchain.record_processing(proc_data)
            proc_data["blockchain_hash"] = blockchain.last_block.hash
            supabase.table("processing_records").insert(proc_data).execute()
            
            # Batch
            batch_code = f"KIB-{h_code}-0126"
            batch_data = {
                "id": str(uuid.uuid4()),
                "batch_id": str(uuid.uuid4()),
                "batch_code": batch_code,
                "processing_id": proc_uuid,
                "harvest_id": harv_uuid,
                "hive_id": h_uuid,
                "apiary_id": a_uuid,
                "farmer_id": f_uuid,
                "production_date": "2026-01-15T12:00:00Z"
            }
            blockchain.create_batch(batch_data)
            b_hash = blockchain.last_block.hash
            
            # Honey Batch
            h_batch = {
                "batch_code": batch_code,
                "honey_type": "Kibwezi Single-Hive Raw",
                "harvest_date": "2026-01-05",
                "packaged_date": "2026-01-15",
                "quantity_kg": 4.0,
                "farmer_name": "Timothy Nduva",
                "location_region": "Kibwezi",
                "status": "verified",
                "blockchain_hash": b_hash
            }
            supabase.table("honey_batches").insert(h_batch).execute()
            print(f"[OK] {batch_code}")

        print("\n[OK] SEEDING COMPLETE")
    except Exception as e:
        print(f"\n[ERROR]: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    cleanup()
    seed()
