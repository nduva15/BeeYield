
import os
import sys
import uuid
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found.")
    sys.exit(1)

supabase: Client = create_client(url, key)

def fix_timothy_data():
    print("=== FIXING TIMOTHY NDUVA DATA ===")
    
    # 1. IDENTIFY USER
    # Try the known UUID from previous scripts
    known_uuid = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6'
    
    # Verify if this user has any data (apiaries/farmers)
    res = supabase.table("apiaries").select("id, name, user_id").eq("user_id", known_uuid).execute()
    user_id = known_uuid
    
    if not res.data:
        print(f"User {known_uuid} has no apiaries. Trying to find by Apiary Name...")
        res = supabase.table("apiaries").select("user_id").eq("name", "Kibwezi Main Apiary").execute()
        if res.data:
            user_id = res.data[0]['user_id']
            print(f"Found User ID from Apiary: {user_id}")
        else:
            print("Could not find Timothy's user ID. Using the known UUID anyway and creating data.")
            # We will proceed with known_uuid, assuming the auth user exists or we are seeding.
            # If auth user doesn't exist, foreign key constraints might fail if they exist.
            # But let's try.
    else:
        print(f"Verified User ID: {user_id}")

    # 2. FIX APIARY
    print("\n[APIARY] Checking/Creating...")
    apiary_id = None
    res = supabase.table("apiaries").select("*").eq("user_id", user_id).eq("name", "Kibwezi Main Apiary").execute()
    
    if res.data:
        apiary = res.data[0]
        apiary_id = apiary['id']
        print(f"  Found 'Kibwezi Main Apiary' ({apiary_id})")
    else:
        # Create it
        print("  Creating 'Kibwezi Main Apiary'...")
        data = {
            "user_id": user_id,
            "name": "Kibwezi Main Apiary",
            "location_name": "Kibwezi",
            "apiary_type": "Permanent",
            "primary_forage": "Acacia",
            "status": "active"
        }
        try:
            res = supabase.table("apiaries").insert(data).execute()
            if res.data:
                apiary_id = res.data[0]['id']
                print(f"  Created Apiary: {apiary_id}")
            else:
                print("  Failed to create apiary (no data returned).")
                return
        except Exception as e:
            print(f"  Error creating apiary: {e}")
            return

    # 3. FIX HIVES (184)
    print("\n[HIVES] Checking/Creating 184 hives...")
    res = supabase.table("hives").select("id", count="exact").eq("user_id", user_id).execute()
    current_count = len(res.data) # count param issues in lib, relying on len(data) if small enough or exact count if supported
    # Supabase-py 'count' property on response object?
    if hasattr(res, 'count') and res.count is not None:
         current_count = res.count
    else:
         current_count = len(res.data) # Fallback, might be limited to 1000

    print(f"  Current Hives: {current_count}")
    
    if current_count < 184:
        needed = 184 - current_count
        print(f"  Adding {needed} hives...")
        
        batch_size = 50
        hives_batch = []
        for i in range(needed):
            idx = current_count + i + 1
            hives_batch.append({
                "hive_code": f"KBZ-{idx:03d}",
                "apiary_id": apiary_id,
                "user_id": user_id,
                "status": "ACTIVE",
                "health_status": "Good",
                "hive_type": "Langstroth"
            })
            
            if len(hives_batch) >= batch_size:
                try:
                    supabase.table("hives").insert(hives_batch).execute()
                    print(f"    Inserted batch of {len(hives_batch)}")
                    hives_batch = []
                except Exception as e:
                    print(f"    Error inserting hives: {e}")
                    
        # Leftovers
        if hives_batch:
            try:
                supabase.table("hives").insert(hives_batch).execute()
                print(f"    Inserted final batch of {len(hives_batch)}")
            except Exception as e:
                print(f"    Error inserting final hives: {e}")
                
    else:
        print("  Hives count sufficient.")
        
    # Get a Hive ID for harvests
    res = supabase.table("hives").select("id").eq("apiary_id", apiary_id).limit(1).execute()
    if not res.data:
        print("  Error: No hives found to attach harvests to!")
        return
    hive_id = res.data[0]['id']

    # 4. FIX HARVESTS
    print("\n[HARVESTS] Fixing historical data...")
    
    # Define Harvests Data
    harvests = [
        # 2020: 13kg
        {"quantity_kg": 6.5,  "harvest_date": '2020-06-15', "honey_type": 'Wildflower', "notes": 'Legacy Sync - First harvest', "batch_code": 'BY-2020-001', "moisture_content_percent": 17.5, "color_grade": "Amber"},
        {"quantity_kg": 6.5,  "harvest_date": '2020-12-15', "honey_type": 'Forest', "notes": 'Legacy Sync - Winter harvest', "batch_code": 'BY-2020-002', "moisture_content_percent": 17.2, "color_grade": "Dark Amber"},
        # 2021: 60kg
        {"quantity_kg": 30,   "harvest_date": '2021-06-15', "honey_type": 'Wildflower', "notes": 'Legacy Sync - Summer harvest', "batch_code": 'BY-2021-001', "moisture_content_percent": 17.4, "color_grade": "Light Amber"},
        {"quantity_kg": 30,   "harvest_date": '2021-12-15', "honey_type": 'Forest', "notes": 'Legacy Sync - Winter harvest', "batch_code": 'BY-2021-002', "moisture_content_percent": 17.6, "color_grade": "Amber"},
        # 2022: 55kg
        {"quantity_kg": 27.5, "harvest_date": '2022-06-15', "honey_type": 'Wildflower', "notes": 'Legacy Sync - Summer harvest', "batch_code": 'BY-2022-001', "moisture_content_percent": 17.1, "color_grade": "Extra Light Amber"},
        {"quantity_kg": 27.5, "harvest_date": '2022-12-15', "honey_type": 'Forest', "notes": 'Legacy Sync - Winter harvest', "batch_code": 'BY-2022-002', "moisture_content_percent": 17.3, "color_grade": "Amber"},
        # 2023: 105kg
        {"quantity_kg": 52.5, "harvest_date": '2023-06-15', "honey_type": 'Wildflower', "notes": 'Legacy Sync - Summer harvest', "batch_code": 'BY-2023-001', "moisture_content_percent": 17.0, "color_grade": "Water White"},
        {"quantity_kg": 52.5, "harvest_date": '2023-12-15', "honey_type": 'Forest', "notes": 'Legacy Sync - Winter harvest', "batch_code": 'BY-2023-002', "moisture_content_percent": 17.8, "color_grade": "Amber"},
        # 2024: 250kg
        {"quantity_kg": 125,  "harvest_date": '2024-06-15', "honey_type": 'Wildflower', "notes": 'Legacy Sync - Summer harvest', "batch_code": 'BY-2024-001', "moisture_content_percent": 16.9, "color_grade": "Extra White"},
        {"quantity_kg": 125,  "harvest_date": '2024-12-15', "honey_type": 'Forest', "notes": 'Legacy Sync - Winter harvest', "batch_code": 'BY-2024-002', "moisture_content_percent": 17.5, "color_grade": "Amber"},
        # 2025: 300kg
        {"quantity_kg": 150,  "harvest_date": '2025-06-15', "honey_type": 'Wildflower', "notes": 'Legacy Sync - Summer harvest', "batch_code": 'BY-2025-001', "moisture_content_percent": 17.2, "color_grade": "Light Amber"},
        {"quantity_kg": 150,  "harvest_date": '2025-12-15', "honey_type": 'Forest', "notes": 'Legacy Sync - Winter harvest', "batch_code": 'BY-2025-002', "moisture_content_percent": 17.4, "color_grade": "Dark Amber"},
        # 2026: 60kg
        {"quantity_kg": 60,   "harvest_date": '2026-01-10', "honey_type": 'Early Spring', "notes": 'Current Year - Jan Harvest', "batch_code": 'BY-2026-001', "moisture_content_percent": 17.5, "color_grade": "Extra Light Amber"},
    ]

    # Delete existing Legacy Sync harvests to avoid duplicates
    try:
        supabase.table("harvests").delete().eq("user_id", user_id).ilike("notes", "Legacy Sync%").execute()
        # Also delete the current year one to refresh it
        supabase.table("harvests").delete().eq("user_id", user_id).ilike("notes", "Current Year%").execute()
        print("  Cleared old sync data.")
    except Exception as e:
        print(f"  Error clearing old data: {e}")

    # Insert new
    count = 0
    for h in harvests:
        try:
            # Common fields
            h["user_id"] = user_id
            h["apiary_id"] = apiary_id
            h["hive_id"] = hive_id
            h["is_verified"] = True
            
            # Try insert
            supabase.table("harvests").insert(h).execute()
            count += 1
        except Exception as e:
            print(f"  Error inserting harvest {h['batch_code']}: {e}")
            # Fallback if column name 'quantity_kg' is wrong -> try 'weight_kg'
            if 'quantity_kg' in str(e) or 'does not exist' in str(e):
                print("  Retrying with weight_kg...")
                try:
                    h["weight_kg"] = h.pop("quantity_kg")
                    supabase.table("harvests").insert(h).execute()
                    count += 1
                except Exception as e2:
                    print(f"  Retry failed: {e2}")

    print(f"  Inserted {count} harvest records.")
    print("\n=== DONE ===")

if __name__ == "__main__":
    fix_timothy_data()
