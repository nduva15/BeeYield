
import sys
import os
import time

# Add backend directory to sys.path so we can import app modules
# Assuming running from Honey/ root
sys.path.append(os.path.abspath("backend"))

from app.db.supabase_db import get_supabase_admin, db_select, db_delete, db_insert, db_get_by_id

def run_migration():
    print("Starting Timothy Nduva Migration (Python Implementation)...")
    
    # 1. Find User ID and Apiary ID via Apiary Search
    print("Searching for apiary 'Kibwezi Main Apiary'...")
    try:
        # Search for apiary by name (case insensitive ideally, but exact for now)
        # SUPABASE REST API filtering: name=eq.Kibwezi Main Apiary
        # Or just get all and filter in python if small number
        apiaries = db_select("apiaries", columns="id,user_id,name")
        
        target_apiary = None
        for a in apiaries:
            if "kibwezi main apiary" in a.get("name", "").lower():
                target_apiary = a
                break
        
        if not target_apiary:
            print("Warning: 'Kibwezi Main Apiary' not found. Checking for 'markempai'...")
            markempai = next((a for a in apiaries if "markempai" in a.get("name", "").lower()), None)
            if markempai:
                target_apiary = markempai
                print(f"Warning: Found 'Markempai' apiary. Using it.")
            elif apiaries:
                # If no specific name found, try to find one with many hives or just pick one?
                # Without user ID, we can't filter by user. 
                # Does any apiary belong to timothy? We don't know his ID.
                # Assuming he created an apiary recently?
                print("Error: Could not identify Timothy's apiary by name. Creating generic one if none found? No user ID available.")
                # We are stuck without User ID.
                # Let's try to query 'profiles' table?
                profiles = db_select("profiles", filters={"email": "timothynduva349@gmail.com"})
                if profiles:
                    user_id = profiles[0]['id']
                    print(f"Found Timothy via profiles: {user_id}")
                    # Now execute original apiary search by user_id
                    user_apiaries = [a for a in apiaries if a['user_id'] == user_id]
                    if user_apiaries:
                        target_apiary = user_apiaries[0] # Pick first
                        # Check for Kibwezi
                        kib = next((a for a in user_apiaries if "kibwezi" in a.get("name", "").lower()), None)
                        if kib: target_apiary = kib
                    else:
                        print("Error: Timothy has no apiaries.")
                        return
                else:
                    print("Error: Could not find user ID via profiles or apiary name.")
                    return
            else:
                 print("Error: No apiaries in DB.")
                 return

        apiary_id = target_apiary['id']
        user_id = target_apiary['user_id']
        print(f"Using Apiary: {target_apiary['name']} ({apiary_id})")
        print(f"Using User ID: {user_id}")

    except Exception as e:
        print(f"Error finding apiary/user: {e}")
        return

    # 3. Clear existing Harvests
    print("Clearing existing harvests...")
    db_delete("harvests", filters={"user_id": user_id})
    
    # 4. Clear existing Hives
    print("Clearing existing hives...")
    db_delete("hives", filters={"user_id": user_id})
    
    # 5. Create 184 Hives
    print("Creating 184 hives...")
    hives_data = []
    for i in range(1, 185):
        hives_data.append({
            "hive_code": f"KIB-H{i:03d}",
            "apiary_id": apiary_id,
            "user_id": user_id,
            "status": "ACTIVE",
            "health_status": "Good"
        })
    
    # Insert in batches of 50 to avoid payload limits
    batch_size = 50
    for i in range(0, len(hives_data), batch_size):
        batch = hives_data[i:i+batch_size]
        res = db_insert("hives", batch) # db_insert handles list? Check db_insert impl.
        # db_insert impl in supabase_db.py takes dict[str, Any], checking impl...
        # Wait, implementation: response = client.post(f"/{table}", json=data, ...)
        # PostgREST supports bulk insert with list of dicts. So it should work.
        if isinstance(res, dict) and not res.get("success", False):
             print(f"Error inserting hives batch {i}: {res.get('error')}")
             return
    
    print("Created 184 hives.")

    # 6. Get first Hive ID for harvests
    first_hive = db_select("hives", filters={"user_id": user_id, "hive_code": "KIB-H001"}, limit=1)
    if not first_hive:
        print("Error: Could not retrieve created hive for linking harvests.")
        return
    hive_id = first_hive[0]['id']

    # 7. Insert Historical Harvests
    print("Inserting historical harvests...")
    harvests_data = [
        # 2020: 4 hives, ~13 kg total
        (6.5,  '2020-06-15', 'Wildflower', 'Legacy Sync - First harvest season', 'BY-2020-001'),
        (6.5,  '2020-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2020-002'),
        
        # 2021: 20 hives, ~60 kg total
        (30,   '2021-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2021-001'),
        (30,   '2021-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2021-002'),
        
        # 2022: 45 hives, 55 kg total
        (27.5, '2022-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2022-001'),
        (27.5, '2022-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2022-002'),
        
        # 2023: 80 hives, 105 kg total
        (52.5, '2023-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2023-001'),
        (52.5, '2023-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2023-002'),
        
        # 2024: 130 hives, 250 kg total
        (125,  '2024-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2024-001'),
        (125,  '2024-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2024-002'),
        
        # 2025: 184 hives, 300 kg total
        (150,  '2025-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2025-001'),
        (150,  '2025-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2025-002'),
        
        # 2026: 184 hives, 60 kg so far
        (60,   '2026-01-10', 'Early Spring', 'Current Year - Jan 3-10 Harvest', 'BY-2026-001'),
    ]

    harvest_payload = []
    for (qty, date, honey_type, notes, batch) in harvests_data:
        harvest_payload.append({
            "user_id": user_id,
            "apiary_id": apiary_id,
            "hive_id": hive_id,
            "quantity_kg": qty,
            "harvest_date": date,
            "honey_type": honey_type,
            "notes": notes,
            "batch_code": batch,
            "is_verified": True
        })
    
    res = db_insert("harvests", harvest_payload)
    if isinstance(res, dict) and not res.get("success", False):
        print(f"Error inserting harvests: {res.get('error')}")
    else:
        print("Successfully inserted 13 harvest records.")
        print("Migration Complete.")

if __name__ == "__main__":
    run_migration()
