
import os
import sqlite3
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load explicitly
load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"--- FORCING SEED VIA PYTHON ---")
print(f"URL: {url}")

s = create_client(url, key)

# Traceability Data
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
    },
    {
        "batch_code": "KIB-ACACIA-24",
        "honey_type": "Pure Acacia",
        "harvest_date": "2024-03-10",
        "packaged_date": "2024-03-15",
        "quantity_kg": 250.0,
        "processing_method": "Centrifuged",
        "quality_grade": "A",
        "farmer_name": "Timothy Nduva",
        "location_region": "Kibwezi",
        "location_county": "Makueni",
        "status": "verified",
        "block_hash": "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
    },
    {
        "batch_code": "KIB-GOLD-24",
        "honey_type": "High Grade Gold",
        "harvest_date": "2024-05-22",
        "packaged_date": "2024-05-27",
        "quantity_kg": 85.0,
        "processing_method": "Raw Unfiltered",
        "quality_grade": "Premium",
        "farmer_name": "Timothy Nduva",
        "location_region": "Kibwezi",
        "location_county": "Makueni",
        "status": "verified",
        "block_hash": "0xabcdef1234567890abcdef1234567890abcdef12"
    }
]

# Upsert Batches
for b in demoBatches:
    try:
        s.table("honey_batches").upsert(b, on_conflict="batch_code").execute()
        print(f"Upserted Batch: {b['batch_code']}")
    except Exception as e:
        print(f"Error Batch {b['batch_code']}: {e}")

# Upsert Farmer
farmer = {
    "name": "Timothy Nduva",
    "phone": "+254712345678",
    "email": "timothy@beeyield.com",
    "experience_years": 15,
    "region": "Kibwezi",
    "county": "Makueni",
    "certification_status": "CERTIFIED",
    "farmer_id": "BY-F-001"
}

try:
    s.table("farmers").upsert(farmer, on_conflict="name").execute()
    print(f"Upserted Farmer: {farmer['name']}")
except Exception as e:
    print(f"Error Farmer: {e}")

print("--- SEEDING DONE ---")
