import asyncio
from datetime import datetime, timedelta
from app.db.supabase_db import db_select, db_insert, db_delete
import uuid
import random

def sync_custom_harvests():
    print("Syncing Custom Harvest Data for Timothy Nduva...")
    
    # 1. Find the User/Farmer
    farmers = db_select("farmers", filters={"name": "Timothy Nduva"}, limit=1)
    if not farmers:
        print("Farmer 'Timothy Nduva' not found.")
        return

    farmer_id = farmers[0]['id']
    print(f"Found Farmer: {farmers[0]['name']} ({farmer_id})")

    # 2. Find Apiaries and Hives (to get user_id)
    apiaries = db_select("apiaries", filters={"farmer_id": farmer_id})
    if not apiaries:
        # Try finding by name if farmer_id link is missing
        apiaries = db_select("apiaries", filters={"name": "Kibwezi Main Apiary"})
    
    if not apiaries:
        print("No apiaries found.")
        return
        
    target_apiary = apiaries[0]
    user_id = target_apiary.get('user_id')
    
    if not user_id:
        print("CRITICAL: Apiary has no user_id. Data will be invisible to frontend API.")
        return

    print(f"Targeting Apiary: {target_apiary['name']} (User: {user_id})")

    hives = db_select("hives", filters={"apiary_id": target_apiary['id']})
    if not hives:
        print("No hives found.")
        return

    # 3. Clean up existing harvests for this farmer to avoid dupes/mess
    print("Cleaning up old harvests for this farmer...")
    db_delete("harvests", {"farmer_id": farmer_id})

    # 4. Insert 60kg Harvest Data
    target_data = [
        {"qty": 20.5, "days_ago": 2, "type": "Acacia"},
        {"qty": 18.0, "days_ago": 5, "type": "Multifloral"},
        {"qty": 21.5, "days_ago": 10, "type": "Acacia"}, 
    ]

    hive_idx = 0
    for data in target_data:
        target_hive = hives[hive_idx % len(hives)]
        hive_idx += 1
        
        harvest_date = (datetime.now() - timedelta(days=data["days_ago"])).strftime('%Y-%m-%d')
        
        new_harvest = {
            "id": str(uuid.uuid4()),
            "hive_id": target_hive['id'],
            "apiary_id": target_apiary['id'],
            "farmer_id": farmer_id,
            "user_id": user_id, # LINK TO USER FOR API VISIBILITY
            "harvest_date": harvest_date,
            "quantity_kg": data["qty"],
            "honey_type": data["type"],
            "color_grade": "Extra Light Amber",
            "batch_code": f"KIB-{datetime.now().year}-{random.randint(1000, 9999)}",
            "is_verified": True,
            "moisture_content": 18.0,
            "harvest_code": f"HRV-{str(uuid.uuid4())[:8].upper()}"
        }
        
        try:
            db_insert("harvests", new_harvest)
            print(f"Added {data['qty']}kg harvest on {harvest_date} (User: {user_id[:8]}...)")
        except Exception as e:
            print(f"Error adding harvest: {e}")

    print("\n[DONE] Successfully synced 60kg harvest across 3 dates.")

if __name__ == "__main__":
    sync_custom_harvests()
