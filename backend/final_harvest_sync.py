import asyncio
import uuid
import random
from datetime import datetime, date
from app.db.supabase_db import db_select, db_delete, db_insert

def final_sync():
    print("=== UPDATING HARVEST DATES TO JAN 10-19 ===")
    
    # 1. Find Timothy Nduva
    farmers = db_select("farmers", filters={"name": "Timothy Nduva"})
    if not farmers:
        print("Error: Timothy Nduva not found.")
        return
    farmer_id = farmers[0]['id']
    
    # 2. Find Kibwezi Apiary
    apiaries = db_select("apiaries", filters={"name": "Kibwezi Main Apiary"})
    if not apiaries:
        print("Error: Kibwezi Main Apiary not found.")
        return
    apiary_id = apiaries[0]['id']

    # 3. Clean up
    print("Cleaning up old harvests...")
    db_delete("harvests", {"farmer_id": farmer_id})

    # 4. Insert 60.0 kg precisely across 3 dates in Jan 10-19 range
    hives = db_select("hives", filters={"apiary_id": apiary_id})
    if not hives:
        print("Error: No hives found.")
        return

    # User request: "january 10-19th"
    target_data = [
        {"qty": 20.0, "date": "2026-01-10", "type": "Acacia"},
        {"qty": 20.0, "date": "2026-01-14", "type": "Multifloral"},
        {"qty": 20.0, "date": "2026-01-19", "type": "Acacia"}, 
    ]
    
    hive_idx = 0
    for data in target_data:
        target_hive = hives[hive_idx % len(hives)]
        hive_idx += 1
        
        new_harvest = {
            "id": str(uuid.uuid4()),
            "hive_id": target_hive['id'],
            "apiary_id": apiary_id,
            "farmer_id": farmer_id,
            "user_id": None, # AUTO-CLAIM will pick it up when they refresh
            "harvest_date": data["date"],
            "quantity_kg": data["qty"],
            "honey_type": data["type"],
            "color_grade": "Extra Light Amber",
            "batch_code": f"KIB-2026-{random.randint(1000, 9999)}",
            "is_verified": True,
            "moisture_content": 18.0,
            "harvest_code": f"HRV-{str(uuid.uuid4())[:8].upper()}"
        }
        db_insert("harvests", new_harvest)
        print(f"Inserted {data['qty']}kg on {data['date']}")

    print("\n[SUCCESS] 60kg Harvest Updated to Jan 10-19 Range.")

if __name__ == "__main__":
    final_sync()
