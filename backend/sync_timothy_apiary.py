import os
import sys
import uuid
import random
import httpx
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.supabase_db import db_select, db_insert, db_update, get_supabase_admin

load_dotenv(".env")
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase admin credentials")
    sys.exit(1)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

TIMOTHY_EMAIL = "timothynduva349@gmail.com"
APIARY_NAME = "Kibwezi Main Apiary" # User asked for "names" (plural?), Assuming this is the main one.

def find_timothy_id():
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    with httpx.Client(base_url=url, headers=headers) as client:
        params = {"page": 1, "per_page": 50}
        while True:
            resp = client.get("", params=params)
            if resp.status_code != 200:
                print(f"Error fetching users: {resp.status_code}")
                return None
            users = resp.json().get("users", [])
            if not users: break
            for u in users:
                if u.get("email") == TIMOTHY_EMAIL:
                    return u.get("id")
            params["page"] += 1
    return None

def sync_timothy_data():
    print(f"Syncing data for Timothy Nduva ({TIMOTHY_EMAIL})...")
    
    # 1. Get User ID
    user_id = find_timothy_id()
    if not user_id:
        print(f"User {TIMOTHY_EMAIL} not found!")
        return
    print(f"Found User ID: {user_id}")

    # 2. Find or Create Apiary
    existing = db_select("apiaries", filters={"user_id": user_id, "name": APIARY_NAME})
    if not existing:
        # Try searching by name only (maybe stripped ownership?)
        existing = db_select("apiaries", filters={"name": APIARY_NAME})
    
    apiary_id = None
    
    if existing:
        apiary = existing[0]
        apiary_id = apiary['id']
        print(f"Found existing apiary: {apiary_id}")
        
        # Update details
        update_data = {
            "size_acres": 5, # Explicit requirement
            "hive_count": 184, # Explicit requirement
            "user_id": user_id, # Ensure ownership
            "apiary_type": "Permanent",
            "status": "active"
        }
        res = db_update("apiaries", update_data, {"id": apiary_id})
        if res.get("success"):
            print("Updated apiary details (acres=5, count=184).")
        else:
            print(f"Failed to update apiary: {res.get('error')}")
    else:
        print("Creating new apiary...")
        new_data = {
            "name": APIARY_NAME,
            "user_id": user_id,
            "apiary_code": "KIB-MAIN",
            "size_acres": 5,
            "hive_count": 184,
            "apiary_type": "Permanent",
            "location_name": "Kibwezi",
            "status": "active",
            "is_active": True
        }
        res = db_insert("apiaries", new_data)
        if res.get("success"):
            apiary = res['data'][0]
            apiary_id = apiary['id']
            print(f"Created apiary: {apiary_id}")
        else:
            print(f"Failed to create apiary: {res.get('error')}")
            return

    # 3. Populate Hives
    if not apiary_id: return

    current_hives = db_select("hives", filters={"apiary_id": apiary_id}, limit=1000)
    count = len(current_hives)
    print(f"Current hives: {count}")
    
    if count < 184:
        needed = 184 - count
        print(f"Adding {needed} hives...")
        hives_batch = []
        for i in range(count + 1, 185):
            hives_batch.append({
                "hive_code": f"KIB-H{i:03d}",
                "apiary_id": apiary_id,
                "user_id": user_id,
                "type": "Langstroth",
                "status": "Active",
                "health_status": "Good",
                "bees_source": "Swarm",
                "colonized_date": (datetime.now() - timedelta(days=random.randint(10, 300))).strftime("%Y-%m-%d")
            })
            
            if len(hives_batch) >= 50:
                db_insert("hives", hives_batch)
                hives_batch = []
                print(f"Inserted batch... ({i}/184)")
        
        if hives_batch:
            db_insert("hives", hives_batch)
            print("Inserted final batch.")
            
    print("Sync complete.")

if __name__ == "__main__":
    sync_timothy_data()
