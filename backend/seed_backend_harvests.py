import asyncio
from datetime import datetime, timedelta
import random
from app.services.traceability_service import record_harvest, register_hive, register_apiary, register_farmer
from app.schemas.traceability import HarvestCreate, HiveCreate, ApiaryCreate, FarmerCreate
import uuid

def seed_data():
    print("Seeding BeeYield Data via Backend Services...")
    
    # 1. Ensure a farmer exists
    farmer_id = str(uuid.uuid4())
    farmer = FarmerCreate(
        name="Timothy Nduva",
        story="3rd generation beekeeper in Kibwezi dedicated to sustainable harvesting.",
        experience_years=15,
        location_name="Kibwezi, Makueni",
        region="Eastern",
        county="Makueni",
        latitude=-2.4,
        longitude=37.9
    )
    # We use a try/catch block implicitly by just calling register (it might duplicate but distinct ID prevents unique constraint overlap if UUID used, 
    # but traceability_service register functions usually return existing if match or create new)
    # Actually register_farmer doesn't check dupes by name typically, but let's just make a new one or continue.
    # For safety, we'll just create fresh linked data chain.
    
    print("Creating Farmer: Timothy Nduva...")
    try:
        f_res = register_farmer(farmer)
        print(f"DEBUG: Farmer Response: {f_res}")
        f_id = f_res.get('id') or f_res.get('farmer_id')
        
        if not f_id:
            print(f"[ERROR] Farmer Creation Failed (No ID): {f_res}")
            return
            
        print(f"[OK] Farmer Created: {f_id}")
    except Exception as e:
        print(f"[ERROR] Farmer Creation Exception: {e}")
        return

    # 2. Apiary
    apiary = ApiaryCreate(
        name="Kibwezi River Site",
        apiary_code="KIB-01",
        farmer_id=f_id,
        location_name="Kibwezi Forest",
        region="Eastern",
        county="Makueni",
        latitude=-2.41,
        longitude=37.92,
        environment_type="Riverine Forest",
        flora_types=["Acacia", "Wildflower"],
        water_source="Seasonal River"
    )
    print("Creating Apiary...")
    try:
        a_res = register_apiary(apiary)
        print(f"DEBUG: Apiary Response: {a_res}")
        a_id = a_res.get('apiary_id')
        
        if not a_id:
            print(f"[ERROR] Apiary Creation Failed (No ID): {a_res}")
            return
            
        print(f"[OK] Apiary Created: {a_id}")
    except Exception as e:
        print(f"[ERROR] Apiary Creation Failed: {e}")
        return

    # 3. Hive
    hive = HiveCreate(
        hive_code="KIB-H001",
        apiary_id=a_id,
        farmer_id=f_id,
        hive_type="Langstroth",
        bee_type="African Honey Bee",
        has_sensors=True,
        installation_date=datetime.now().date()
    )
    print("Creating Hive...")
    try:
        h_res = register_hive(hive)
        print(f"DEBUG: Hive Response: {h_res}")
        h_id = h_res.get('hive_id')
        
        if not h_id:
            print(f"[ERROR] Hive Creation Failed (No ID): {h_res}")
            return
            
        print(f"[OK] Hive Created: {h_id}")
    except Exception as e:
        print(f"[ERROR] Hive Creation Failed: {e}")
        return

    # 4. Harvests (Create 3)
    honey_types = ["Acacia", "Multifloral", "Dark Forest"]
    colors = ["Water White", "Extra Light Amber", "Dark Amber"]
    
    for i in range(5):
        h_date = (datetime.now() - timedelta(days=random.randint(0, 20))).date()
        qty = round(random.uniform(15.0, 30.0), 1)
        
        harvest = HarvestCreate(
            hive_id=h_id,
            farmer_id=f_id,
            harvest_date=h_date,
            quantity_kg=qty,
            quantity_left_for_bees_kg=qty, # 50/50
            honey_type=honey_types[i % len(honey_types)],
            color_grade=colors[i % len(colors)],
            batch_code=f"BATCH-{random.randint(1000, 9999)}",
            is_verified=True,
            moisture_content_percent=17.5,
            extraction_method="Cold Press"
        )
        
        print(f"  Creating Harvest {i+1}: {harvest.quantity_kg}kg ({harvest.honey_type}) on {harvest.harvest_date}...")
        try:
            res = record_harvest(harvest)
            print(f"  [OK] Harvest Sealed! Hash: {res.get('blockchain_hash', 'N/A')[:10]}...")
        except Exception as e:
            print(f"[ERROR] Harvest Creation Failed: {e}")

    print("\n[DONE] Seeding Complete! Data is now available in backend and frontend.")

if __name__ == "__main__":
    seed_data()
