
import os
import sys
import uuid
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
# Look for .env in current dir and backend dir
load_dotenv(dotenv_path=".env")
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print(f"Error: Supabase credentials not found. URL: {url}, KEY: {key[:10] if key else 'None'}...")
    sys.exit(1)

print(f"Connecting to: {url}")
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
    
    # Get all hives to create per-hive batches
    res_hives = supabase.table("hives").select("id, hive_code").eq("user_id", user_id).execute()
    all_user_hives = res_hives.data
    
    # 2020 Harvest: 943kg total
    # 943 / 184 = 5.125 kg per hive
    print(f"  Generating 2020 harvests (943kg total across {len(all_user_hives)} hives)...")
    
    harvests_to_insert = []
    
    # 2020 Data
    for i, hive in enumerate(all_user_hives):
        h_date = "2020-06-15"
        h_code = hive['hive_code'].replace("-", "").upper()[-4:]
        batch_code = f"BY-20200615-{h_code}"
        
        harvests_to_insert.append({
            "user_id": user_id,
            "apiary_id": apiary_id,
            "hive_id": hive['id'],
            "quantity_kg": 5.125,
            "harvest_date": h_date,
            "honey_type": 'Wildflower',
            "notes": 'Legacy Sync - 2020 943kg Audit',
            "batch_code": batch_code,
            "moisture_content_percent": 17.5,
            "color_grade": "Amber",
            "is_verified": True
        })

    # Other Years (Summarized or sample)
    # 2026: 60kg (Fixed to Jan 3-10 period)
    harvests_to_insert.append({
        "user_id": user_id,
        "apiary_id": apiary_id,
        "hive_id": all_user_hives[0]['id'],
        "quantity_kg": 60,
        "harvest_date": '2026-01-05',
        "honey_type": 'Early Spring',
        "notes": 'Current Year - Jan Harvest Window',
        "batch_code": f"BY-20260105-{all_user_hives[0]['hive_code'].replace('-', '').upper()[-4:]}",
        "moisture_content_percent": 17.5,
        "color_grade": "Extra Light Amber",
        "is_verified": True
    })

    # Delete existing Legacy Sync harvests to avoid duplicates
    try:
        supabase.table("harvests").delete().eq("user_id", user_id).ilike("notes", "Legacy Sync%").execute()
        # Also delete the current year one to refresh it
        supabase.table("harvests").delete().eq("user_id", user_id).ilike("notes", "Current Year%").execute()
        print("  Cleared old sync data.")
    except Exception as e:
        print(f"  Error clearing old data: {e}")

    # Insert in batches
    count = 0
    batch_size = 50
    for i in range(0, len(harvests_to_insert), batch_size):
        batch = harvests_to_insert[i:i+batch_size]
        try:
            supabase.table("harvests").insert(batch).execute()
            count += len(batch)
            print(f"    Inserted batch of {len(batch)} harvests...")
        except Exception as e:
            print(f"    Error inserting batch: {e}")
            # Individual fallback if batch fails
            for h in batch:
                try:
                    supabase.table("harvests").insert(h).execute()
                    count += 1
                except:
                    pass

    print(f"  Inserted {count} total harvest records.")
    print("\n=== DONE ===")

if __name__ == "__main__":
    fix_timothy_data()
