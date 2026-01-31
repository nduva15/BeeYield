import os
import sys
import uuid
import random
from datetime import datetime, date, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed():
    print("--- Seeding Real Traceability Data (Kibwezi) ---")
    
    # 1. Farmer: Timothy Nduva
    farmer_data = {
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
        "certification_status": "CERTIFIED",
        "total_hives": 184,
        "registration_date": "2020-01-15T00:00:00+00:00"
    }
    
    res = supabase.table("farmers").insert(farmer_data).execute()
    v_farmer_id = res.data[0]["id"]
    print(f"✓ Created Farmer: {farmer_data['name']}")

    # 2. Apiary: Kibwezi Main Apiary
    apiary_data = {
        "apiary_id": "A-KIB-001",
        "apiary_code": "KIB-001",
        "name": "Kibwezi Main Apiary",
        "farmer_id": v_farmer_id,
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
    
    res = supabase.table("apiaries").insert(apiary_data).execute()
    v_apiary_id = res.data[0]["id"]
    print(f"✓ Created Apiary: {apiary_data['name']}")

    # 3. Hives (184 Total)
    print("Seeding 184 Hives...")
    hives_to_insert = []
    for i in range(1, 185):
        hive_code = f"KIB-H{i:03d}"
        hive_type = "Langstroth" if i <= 40 else "Traditional Log"
        hives_to_insert.append({
            "hive_code": hive_code,
            "apiary_id": v_apiary_id,
            "farmer_id": v_farmer_id,
            "hive_type": hive_type,
            "bee_type": "African Honey Bee (Apis mellifera scutellata)",
            "frame_count": 10 if i <= 40 else 0,
            "material": "Cedar Wood" if i <= 40 else "Hollow Mango Log",
            "installation_date": "2024-01-15",
            "has_sensors": i <= 15,
            "status": "ACTIVE"
        })
    
    # Batch insert in chunks of 50 to avoid timeouts
    for i in range(0, len(hives_to_insert), 50):
        supabase.table("hives").insert(hives_to_insert[i:i+50]).execute()
    
    print("✓ 184 Hives created.")

    # 4. Harvests (15 Hives, 60kg total)
    print("Seeding Harvests...")
    v_harvest_ids = []
    # Get the first 15 hives
    res = supabase.table("hives").select("id, hive_code").eq("apiary_id", v_apiary_id).order("hive_code").limit(15).execute()
    hives_list = res.data
    
    for i, hive in enumerate(hives_list, 1):
        # Match the logic in the SQL script
        if i <= 2:
            # Jan 3 and Jan 10
            dates = ["2026-01-03", "2026-01-10"]
            qty = 2.0
        elif i <= 4:
            # Jan 4 and Jan 10
            dates = ["2026-01-04", "2026-01-10"]
            qty = 2.0
        elif i <= 6:
            # Jan 5 and Jan 10
            dates = ["2026-01-05", "2026-01-10"]
            qty = 2.0
        elif i <= 8:
            # Jan 6 and Jan 10
            dates = ["2026-01-06", "2026-01-10"]
            qty = 2.0
        elif i <= 11:
            # Jan 7 (4kg)
            dates = ["2026-01-07"]
            qty = 4.0
        elif i <= 13:
            # Jan 8 (4kg)
            dates = ["2026-01-08"]
            qty = 4.0
        else:
            # Jan 9 (4kg)
            dates = ["2026-01-09"]
            qty = 4.0
            
        for d in dates:
            h_data = {
                "hive_id": hive["id"],
                "farmer_id": v_farmer_id,
                "harvest_date": d,
                "quantity_kg": qty,
                "quantity_left_for_bees_kg": qty,
                "extraction_method": "Cold Extraction",
                "nectar_source": "Acacia/Sunflower",
                "weather_conditions": "Sunny",
                "moisture_content_percent": 17.4
            }
            res_h = supabase.table("harvests").insert(h_data).execute()
            v_harvest_ids.append(res_h.data[0]["id"])

    print("✓ Harvest records created.")

    # 5. Processing Record
    processing_data = {
        "harvest_id": v_harvest_ids[0],
        "processing_date": "2026-01-12",
        "processor_name": "BeeYield Central Processing",
        "facility_location": "Makueni Facility",
        "filtering_method": "Coarse Mesh Filter (200 micron)",
        "moisture_content_percent": 17.4,
        "is_raw": True
    }
    res = supabase.table("processing_records").insert(processing_data).execute()
    v_processing_id = res.data[0]["id"]
    print("✓ Processing record created.")

    # 6. Batches
    batch_data = [
        {
            "batch_code": "KIB-JAN2026-001",
            "processing_id": v_processing_id,
            "packaging_date": "2026-01-15",
            "expiry_date": "2028-01-15",
            "quantity_jars": 120,
            "jar_size_grams": 500
        }
    ]
    supabase.table("batches").insert(batch_data).execute()
    
    # Also honey_batches if it exists
    honey_batch_data = {
        "batch_code": "KIB-JAN2026-001",
        "honey_type": "Wildflower Multi-floral",
        "harvest_date": "2026-01-10",
        "packaged_date": "2026-01-15",
        "quantity_kg": 60.0,
        "processing_method": "Cold Extraction - Raw",
        "farmer_name": "Timothy Nduva",
        "location_county": "Makueni",
        "location_region": "Kibwezi",
        "latitude": -2.41,
        "longitude": 37.97,
        "quality_grade": "Premium",
        "certifications": ['Organic', 'Fair Trade', 'KEBS Certified'],
        "moisture_content": 17.4,
        "status": "verified"
    }
    try:
        supabase.table("honey_batches").insert(honey_batch_data).execute()
    except:
        pass
        
    print(f"✓ Real Batch created: {honey_batch_data['batch_code']}")
    print("\n--- Seeding Complete ---")

if __name__ == "__main__":
    seed()
