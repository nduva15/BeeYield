import sys
import os
import uuid

# Add current dir to path to find "app"
sys.path.append(os.getcwd())

from app.db.supabase_db import db_insert, db_select

print("Running test_apiary_insert_v2...")

# Check existing apiaries first
try:
    existing = db_select("apiaries", limit=1)
    print(f"Existing apiaries count check: {len(existing)}")
    if existing:
        print(f"Sample: {existing[0].get('name')}")
except Exception as e:
    print(f"Select failed: {e}")

# Try insert
test_apiary_code = f"APY-{str(uuid.uuid4())[:8].upper()}"
test_data = {
    "name": "Test Apiary V2",
    "apiary_code": test_apiary_code,
    "apiary_type": "Permanent",
    "location_name": "Test Location",
    "status": "active",
    "is_active": True,
    # Use a real user ID if possible or dummy
    "user_id": "00000000-0000-0000-0000-000000000000", 
}

print(f"Attempting valid DB insert with: {test_data}")

result = db_insert("apiaries", test_data)

if result.get("success"):
    print("SUCCESS: Apiary created via db_insert.")
    print(result.get("data"))
else:
    print(f"FAILURE: {result.get('error')}")
