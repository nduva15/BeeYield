
import os
import sys
from uuid import uuid4
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import db_select, db_insert, db_update, db_upsert

load_dotenv()

def test_crud_logic():
    print("🚀 Testing Settings CRUD logic...")
    
    # 1. Mock User ID (must verify if this user exists, or insert a fake one if RLS allows?)
    # Since we use service role in db_*, RLS is bypassed. 
    # But constraints (fk to auth.users) might fail if user doesn't exist.
    # Let's pick a known user ID from previous scripts if possible.
    # Timothy's ID from migration script: 10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6 (fallback) or we can find one.
    
    # Let's find a user first
    users = db_select("profiles", limit=1)
    if not users:
        print("❌ No users found in profiles to test with.")
        return
        
    user_id = users[0]['id']
    print(f"👤 Using User ID: {user_id}")
    
    # 2. Test Global Threshold Upsert logic (Python equivalent of endpoint)
    print("\n--- Testing Global Threshold Update ---")
    
    # Logic from endpoint:
    filters = {"user_id": user_id, "hive_id": "is.null"}
    existing = db_select("alert_thresholds", filters=filters)
    
    print(f"Existing global: {existing}")
    
    payload = {
        "user_id": user_id,
        "hive_id": None,
        "temp_high": 40.5,
        "weight_drop": 2.5
    }
    
    if existing:
        print("Update path...")
        res = db_update("alert_thresholds", payload, {"id": existing[0]["id"]})
    else:
        print("Insert path...")
        res = db_insert("alert_thresholds", payload)
        
    print(f"Result: {res}")
    if not res.get("success"):
        print(f"❌ Failed: {res.get('error')}")
    else:
        print("✅ Global Success")
        
    # 3. Test Specific Hive Threshold
    # Ensure a hive exists
    hives = db_select("hives", filters={"user_id": user_id}, limit=1)
    if not hives:
        print("❌ No hives found.")
        return
        
    hive_id = hives[0]['id']
    print(f"\n--- Testing Hive Specific Update ({hive_id}) ---")
    
    filters = {"user_id": user_id, "hive_id": hive_id}
    existing = db_select("alert_thresholds", filters=filters)
    
    print(f"Existing specific: {existing}")
    
    payload = {
        "user_id": user_id,
        "hive_id": hive_id,
        "temp_high": 39.9
    }
    
    if existing:
        res = db_update("alert_thresholds", payload, {"id": existing[0]["id"]})
    else:
        res = db_insert("alert_thresholds", payload)
        
    print(f"Result: {res}")
    if not res.get("success"):
         print(f"❌ Failed: {res.get('error')}")
    else:
         print("✅ Specific Success")

if __name__ == "__main__":
    try:
        test_crud_logic()
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
