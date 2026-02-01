import os
import sys
import uuid
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_select, db_delete, db_insert, db_update

def cleanup_and_sync():
    print("=" * 60)
    print("CLEANUP: Setting up 1 Apiary with exactly 184 Hives")
    print("=" * 60)
    
    # 1. Get all apiaries
    apiaries = db_select('apiaries')
    print(f"\nFound {len(apiaries)} apiaries")
    
    # Find Kibwezi Main Apiary
    main_apiary = None
    other_apiaries = []
    for a in apiaries:
        if 'Main' in a.get('name', ''):
            main_apiary = a
        else:
            other_apiaries.append(a)
    
    if not main_apiary:
        # If no "Main" apiary, pick the first one and rename it
        if apiaries:
            main_apiary = apiaries[0]
            other_apiaries = apiaries[1:]
            print(f"No 'Main' apiary found. Using: {main_apiary['name']}")
        else:
            print("No apiaries found! Creating one...")
            # Get farmer
            farmers = db_select('farmers')
            farmer_id = farmers[0]['id'] if farmers else None
            
            apiary_data = {
                "apiary_id": str(uuid.uuid4()),
                "apiary_code": "KIB-MAIN",
                "name": "Kibwezi Main Apiary",
                "farmer_id": farmer_id,
                "environment_type": "Savannah Wooded",
                "location_name": "Kibwezi",
                "latitude": -2.41,
                "longitude": 37.97,
                "hive_count": 184,
                "is_active": True
            }
            res = db_insert("apiaries", apiary_data)
            if res['success']:
                main_apiary = res['data'][0]
                print(f"Created: {main_apiary['name']}")
            else:
                print(f"Failed to create apiary: {res['error']}")
                return
    
    main_apiary_id = main_apiary['id']
    print(f"\nKEEPING: {main_apiary['name']} (ID: {main_apiary_id})")
    
    # 2. Delete hives from other apiaries
    for a in other_apiaries:
        print(f"\nDeleting hives from: {a['name']}")
        result = db_delete("hives", {"apiary_id": a['id']})
        if result['success']:
            print(f"  Hives deleted")
        else:
            print(f"  Error: {result.get('error')}")
    
    # 3. Delete other apiaries
    for a in other_apiaries:
        print(f"Deleting apiary: {a['name']}")
        result = db_delete("apiaries", {"id": a['id']})
        if result['success']:
            print(f"  Apiary deleted")
        else:
            print(f"  Error: {result.get('error')}")
    
    # 4. Count current hives in main apiary
    current_hives = db_select("hives", filters={"apiary_id": main_apiary_id}, limit=1000)
    print(f"\nCurrent hives in main apiary: {len(current_hives)}")
    
    # Get farmer for new hives
    farmers = db_select('farmers')
    farmer_id = farmers[0]['id'] if farmers else None
    
    # 5. Adjust to exactly 184
    if len(current_hives) < 184:
        needed = 184 - len(current_hives)
        print(f"Adding {needed} hives...")
        
        hives_to_add = []
        start_num = len(current_hives) + 1
        for i in range(start_num, start_num + needed):
            hives_to_add.append({
                "hive_id": str(uuid.uuid4()),
                "hive_code": f"KIB-M-H{i:03d}",
                "apiary_id": main_apiary_id,
                "farmer_id": farmer_id,
                "hive_type": random.choice(["Langstroth", "Top Bar", "Kenyan Top Bar"]),
                "bee_type": "African Honey Bee",
                "frame_count": random.randint(8, 12),
                "has_sensors": random.choice([True, False]),
                "installation_date": (datetime.now() - timedelta(days=random.randint(30, 730))).date().isoformat()
            })
        
        # Insert in batches
        for i in range(0, len(hives_to_add), 50):
            batch = hives_to_add[i:i+50]
            res = db_insert("hives", batch)
            if res['success']:
                print(f"  Inserted batch {i//50 + 1} ({len(batch)} hives)")
            else:
                print(f"  Error: {res['error']}")
                
    elif len(current_hives) > 184:
        excess = len(current_hives) - 184
        print(f"Removing {excess} excess hives...")
        # Delete oldest/last hives
        hives_to_delete = current_hives[184:]
        for h in hives_to_delete:
            db_delete("hives", {"id": h['id']})
        print(f"  Deleted {excess} hives")
    else:
        print("Already have exactly 184 hives!")
    
    # 6. Update apiary hive_count field
    db_update("apiaries", {"hive_count": 184, "name": "Kibwezi Main Apiary"}, {"id": main_apiary_id})
    print("\nUpdated apiary hive_count to 184")
    
    # 7. Final verification
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)
    final_apiaries = db_select('apiaries')
    final_hives = db_select('hives', limit=1000)
    print(f"Total Apiaries: {len(final_apiaries)}")
    print(f"Total Hives: {len(final_hives)}")
    for a in final_apiaries:
        count = len([h for h in final_hives if h.get('apiary_id') == a['id']])
        print(f"  - {a['name']}: {count} hives (field: {a.get('hive_count')})")
    print("=" * 60)

if __name__ == "__main__":
    cleanup_and_sync()
