"""
Direct database test to isolate apiary creation issue.
Bypasses the API to test raw db_insert.
"""
import sys
sys.path.insert(0, '.')

from app.db.supabase_db import db_insert, db_select
import uuid

# Test data matching what the API would send
test_user_id = str(uuid.uuid4())
test_apiary_code = f"APY-{str(uuid.uuid4())[:8].upper()}"

data = {
    "name": "Test Apiary Direct",
    "user_id": test_user_id,
    "apiary_code": test_apiary_code,
    "apiary_type": "Permanent",
    "location_name": "Test Location",
    "expected_hives": 10,
    "size_acres": 5.0,
    "is_active": True
}

print(f"Attempting to insert apiary with data: {data}")
result = db_insert("apiaries", data)
print(f"Result: {result}")

if result.get("success"):
    print("SUCCESS! Apiary created.")
    # Clean up
    from app.db.supabase_db import db_delete
    db_delete("apiaries", {"apiary_code": test_apiary_code})
    print("Cleaned up test apiary.")
else:
    print(f"FAILED: {result.get('error')}")
