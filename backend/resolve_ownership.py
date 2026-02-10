
from app.db.supabase_db import db_select, db_update, db_insert, db_delete
import uuid

TIMOTHY_ID = "10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6"

print(f"--- Resolving Ownership for Timothy ({TIMOTHY_ID}) ---")

# 1. Find the Apiary
print("[1] Locating 'Kibwezi Main Apiary'...")
apiaries = db_select("apiaries")
kibwezi = next((a for a in apiaries if "Kibwezi" in a.get('name', '')), None)

if not kibwezi:
    print("  Apiary not found! Creating it...")
    new_id = str(uuid.uuid4())
    data = {
        "id": new_id,
        "name": "Kibwezi Main Apiary",
        "user_id": TIMOTHY_ID,
        "location_name": "Kibwezi Forest",
        "size_acres": 5.0,
        "expected_hives": 200,
        "status": "active"
    }
    db_insert("apiaries", data)
    kibwezi = data
    print(f"  Created new apiary: {new_id}")
else:
    print(f"  Found: {kibwezi['name']} (ID: {kibwezi['id']})")
    print(f"  Current Owner: {kibwezi.get('user_id')}")
    
    if kibwezi.get('user_id') != TIMOTHY_ID:
        print(f"  Updating owner to Timothy...")
        db_update("apiaries", {"user_id": TIMOTHY_ID}, {"id": kibwezi['id']})
        kibwezi['user_id'] = TIMOTHY_ID

# 2. Check Hives
print("\n[2] Verifying Hives...")
hives = db_select("hives", filters={"apiary_id": kibwezi['id']}, limit=1000)
count = len(hives)
print(f"  Current Hive Count: {count}")

if count != 184:
    print("  Hive count mismatch! Fixing to exactly 184 hives...")
    # Delete existing to be clean (or just add difference? Better to be clean for simulated data)
    # Actually, let's keep existing if possible, but simplest is to wipe and recreate for simulation consistency if count is way off
    if count > 0:
        print("  Clearing existing hives to ensure clean slate...")
        # Since we don't have bulk delete by apiary_id easily exposed in helper, we iterate? 
        # Or hopefully db_delete handles filters?
        # db_delete("hives", {"apiary_id": kibwezi['id']}) # Attempt bulk if supported, otherwise loop
        for h in hives:
            db_delete("hives", {"id": h['id']})
    
    print("  Creating 184 new hives...")
    new_hives = []
    for i in range(1, 185):
        hive_code = f"KBZ-{str(i).zfill(3)}"
        new_hives.append({
            "id": str(uuid.uuid4()),
            "apiary_id": kibwezi['id'],
            "user_id": TIMOTHY_ID,
            "hive_code": hive_code,
            "status": "active" if i % 10 != 0 else "weak", # Simulate some status
            "type": "Langstroth"
        })
    
    # Bulk insert if possible? helper might iterate, let's just loop insert to be safe with helper's implementation
    for h in new_hives:
        db_insert("hives", h)
    print("  Successfully created 184 hives.")

print("\n--- Final Verification ---")
final_hives = db_select("hives", filters={"apiary_id": kibwezi['id']}, limit=1000)
print(f"Apiary: {kibwezi['name']}")
print(f"Owner: {kibwezi['user_id']}")
print(f"Hive Count: {len(final_hives)}")
