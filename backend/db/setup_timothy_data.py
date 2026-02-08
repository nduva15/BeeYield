import os
import sys
import uuid
import random
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Connected to Supabase: {SUPABASE_URL}")

def get_timothy_user_id():
    """Get the user ID for timothynduva349@gmail.com"""
    try:
        # 1. Try to find in auth.admin (most reliable if service role key is available)
        try:
            users = supabase.auth.admin.list_users()
            for user in users:
                if user.email == "timothynduva349@gmail.com":
                    print(f"   ✓ Found User ID for Timothy in Auth: {user.id}")
                    # Ensure profile exists since other parts of app rely on it
                    try:
                        supabase.table("profiles").upsert({
                            "id": user.id,
                            "email": user.email,
                            "full_name": "Timothy Nduva"
                        }).execute()
                    except:
                        pass
                    return user.id
        except Exception as e:
            print(f"   ! Could not list auth users: {e}")
            pass

        # 2. Search in user_profiles or profiles for the specific email
        for table in ["profiles", "user_profiles"]:
            try:
                res = supabase.table(table).select("id").eq("email", "timothynduva349@gmail.com").execute()
                if res.data:
                    print(f"   ✓ Found User ID for Timothy in {table}: {res.data[0]['id']}")
                    return res.data[0]["id"]
            except:
                continue
        
        # 3. Fallback to any user if Timothy not found, but warn
        for table in ["profiles", "user_profiles"]:
            try:
                res = supabase.table(table).select("id").limit(1).execute()
                if res.data:
                    print(f"   ! User 'timothynduva349@gmail.com' not found. Falling back to ID from {table}: {res.data[0]['id']}")
                    return res.data[0]["id"]
            except:
                continue
            
        return None
    except Exception as e:
        print(f"   [DEBUG] Could not fetch user_id: {e}")
        return None

def clear_all_beeyield_data():
    """Wipe all existing BeeYield related data to remove mock entries"""
    print("--- Wiping all BeeYield data (leaving only real data soon) ---")
    tables = [
        "inspections", "tasks", "processing_records", "harvests", 
        "hives", "apiaries", "farmers", "iot_devices", "sensor_readings",
        "colonies", "flower_sources", "honey_batches", "packaged_batches",
        "blockchain_records", "pollination_contracts", "hive_assignments",
        "pollination_activity_logs", "activity_logs", "tracing_history"
    ]
    for table in tables:
        try:
            print(f"   - Clearing {table}...")
            # Use as much force as possible to delete everything
            supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception as e:
            # Table might not exist or have RLS issues, skip
            print(f"   --> Skipped {table}: {e}")
            pass

def setup_timothy_data(user_id):
    print("\n--- Setting up Timothy Nduva's Data ---")
    
    # 1. Insert Farmer
    farmer_data = {
        "farmer_id": "F-TIM-001",
        "name": "Timothy Nduva",
        "phone": "+254 700 000 000",
        "region": "Kibwezi",
        "county": "Makueni",
        "experience_years": 6,
        "story": "Timothy Nduva is a visionary beekeeper at the forefront of precision pollination in Kenya.",
        "latitude": -2.41,
        "longitude": 37.97,
        "location_name": "Kibwezi",
        "certification_status": "CERTIFIED",
        "total_hives": 184,
        "user_id": user_id
    }
    
    f_res = supabase.table("farmers").insert(farmer_data).execute()
    if not f_res.data:
        print("X Error inserting farmer")
        return
    
    farmer_db_id = f_res.data[0]["id"]
    print(f"   ✓ Farmer 'Timothy Nduva' created (ID: {farmer_db_id})")

    # 2. Insert Apiary
    apiary_data = {
        "apiary_id": str(uuid.uuid4()),
        "apiary_code": "KIB-MAIN-001",
        "name": "Kibwezi Main Apiary",
        "farmer_id": farmer_db_id,
        "environment_type": "Savannah Wooded",
        "location_name": "Kibwezi",
        "latitude": -2.41,
        "longitude": 37.97,
        "region": "Eastern",
        "county": "Makueni",
        "hive_count": 184,
        "size_acres": 5.0,
        "description": "A 5-acre leading precision pollination hub in Kibwezi.",
        "is_active": True,
        "user_id": user_id
    }
    
    a_res = supabase.table("apiaries").insert(apiary_data).execute()
    if not a_res.data:
        print("X Error inserting apiary")
        return
    
    apiary_db_id = a_res.data[0]["id"]
    print(f"   ✓ Apiary 'Kibwezi Main Apiary' created (ID: {apiary_db_id})")

    # 3. Insert 184 Hives
    print(f"   - Generating 184 hives for '{apiary_data['name']}'...")
    hives_to_insert = []
    for i in range(1, 185):
        hive_code = f"KIB-MAIN-H{i:03d}"
        hives_to_insert.append({
            "hive_id": str(uuid.uuid4()),
            "hive_code": hive_code,
            "apiary_id": apiary_db_id,
            "farmer_id": farmer_db_id,
            "hive_type": "Langstroth",
            "bee_type": "African Honey Bee",
            "frame_count": 10,
            "has_sensors": random.choice([True, False]),
            "status": "ACTIVE",
            "installation_date": "2023-01-01",
            "user_id": user_id
        })
    
    # Insert in batches of 50 to avoid payload size limits
    batch_size = 50
    for i in range(0, len(hives_to_insert), batch_size):
        batch = hives_to_insert[i:i+batch_size]
        supabase.table("hives").insert(batch).execute()
        print(f"     ...inserted hives {i+1} to {min(i+batch_size, 184)}")

    print(f"   ✓ Successfully created 184 hives.")

def update_company_stats():
    """Update dashboard stats to match the new data"""
    print("\n--- Updating Dashboard Stats ---")
    stats = [
        {"stat_key": "active_colonies", "stat_value": "184", "stat_label": "Active Hives"},
        {"stat_key": "acres_pollinated", "stat_value": "5", "stat_label": "Acres Pollinated"},
        {"stat_key": "apiary_size", "stat_value": "5", "stat_label": "Acre Apiary"}
    ]
    
    for stat in stats:
        try:
            supabase.table("company_stats").update(stat).eq("stat_key", stat["stat_key"]).execute()
        except:
            pass
    print("   ✓ Dashboard stats updated.")

def main():
    print("=" * 60)
    print("BeeYield Timothy Nduva Data Setup")
    print("=" * 60)
    
    user_id = get_timothy_user_id()
    if not user_id:
        print("! Warning: No user_id found. Data will be created without owner.")
        print("! You may need to run 'backend/db/sync_beeyield_data.sql' afterwards.")
    else:
        print(f"Using User ID: {user_id}")
    
    clear_all_beeyield_data()
    setup_timothy_data(user_id)
    update_company_stats()
    
    print("\n" + "=" * 60)
    print("SUCCESS: Data setup finished!")
    print("=" * 60)

if __name__ == "__main__":
    main()
