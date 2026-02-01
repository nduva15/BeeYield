import sys
import os
import asyncio

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import db_select, db_delete, db_insert, db_update

def cleanup_data():
    print("--- Starting Cleanup Data ---")
    
    # 1. Get all apiaries
    apiaries = db_select("apiaries")
    print(f"Current apiaries: {len(apiaries)}")
    for a in apiaries:
        print(f" - {a['name']} (ID: {a['id']}, Code: {a['apiary_code']})")

    # 2. Find or create Kibwezi Main
    kibwezi_main = next((a for a in apiaries if "Kibwezi Main" in a['name']), None)
    
    if not kibwezi_main:
        print("Kibwezi Main not found. Creating it...")
        # Get a farmer ID to associate with
        farmers = db_select("farmers")
        farmer_id = farmers[0]['id'] if farmers else None
        
        kibwezi_data = {
            "name": "Kibwezi Main",
            "apiary_code": "KIB-001",
            "location_name": "Kibwezi",
            "region": "Eastern",
            "county": "Makueni",
            "latitude": -2.4200,
            "longitude": 37.9500,
            "farmer_id": farmer_id,
            "is_active": True
        }
        res = db_insert("apiaries", kibwezi_data)
        if res.get("success"):
            kibwezi_main = res['data'][0]
            print(f"Created Kibwezi Main: {kibwezi_main['id']}")
        else:
            print(f"Failed to create Kibwezi Main: {res.get('error')}")
            return
    else:
        print(f"Found Kibwezi Main: {kibwezi_main['id']}")

    # 3. Delete other apiaries
    for a in apiaries:
        if a['id'] != kibwezi_main['id']:
            print(f"Deleting apiary: {a['name']} ({a['id']})")
            # We might need to handle foreign keys, but let's try
            # Actually, let's reassign hives first
            db_update("hives", {"apiary_id": kibwezi_main['id']}, {"apiary_id": a['id']})
            db_update("harvests", {"apiary_id": kibwezi_main['id']}, {"apiary_id": a['id']})
            db_delete("apiaries", {"id": a['id']})

    # 4. Ensure 184 hives
    hives = db_select("hives", filters={"apiary_id": kibwezi_main['id']})
    print(f"Current hives in Kibwezi Main: {len(hives)}")
    
    if len(hives) < 184:
        to_add = 184 - len(hives)
        print(f"Adding {to_add} hives...")
        for i in range(to_add):
            hive_code = f"HIVE-{len(hives) + i + 1:03d}"
            hive_data = {
                "hive_code": hive_code,
                "apiary_id": kibwezi_main['id'],
                "status": "ACTIVE",
                "hive_type": "Langstroth",
                "bee_type": "African Honey Bee"
            }
            db_insert("hives", hive_data)
    elif len(hives) > 184:
        to_remove = len(hives) - 184
        print(f"Removing {to_remove} extra hives...")
        for i in range(to_remove):
            db_delete("hives", {"id": hives[i]['id']})

    print("--- Cleanup Finished ---")

if __name__ == "__main__":
    cleanup_data()
