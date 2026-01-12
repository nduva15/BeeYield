
import os
import sqlite3
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"URL: {url}")
print(f"KEY: {key[:15]}...")

s = create_client(url, key)

demoBatches = [
    {
        "batch_code": "DEMO-001",
        "honey_type": "Acacia Gold",
        "harvest_date": "2024-01-15",
        "packaged_date": "2024-01-20",
        "quantity_kg": 120.5,
        "processing_method": "Cold Pressed",
        "quality_grade": "A+",
        "farmer_name": "Timothy Nduva",
        "location_region": "Kibwezi",
        "location_county": "Makueni",
        "status": "verified",
        "block_hash": "0x7ae568e3f4b4e5d8a9b2c1d0e9f8a7b6c5d4e3f2"
    }
]

print("--- TESTING INSERT ---")
try:
    # Use direct postgrest style if helpful
    res = s.table("honey_batches").insert(demoBatches).execute()
    print("SUCCESS: Inserted 1 batch.")
except Exception as e:
    print(f"FAIL INSERT: {e}")

try:
    res = s.table("honey_batches").select("*").limit(1).execute()
    print(f"SELECT SUCCESS: found {len(res.data)} rows")
except Exception as e:
    print(f"FAIL SELECT: {e}")
