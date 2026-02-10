
from app.db.supabase_db import db_update, db_select

correct_user_id = "10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6"
wrong_user_id = "cde9c716-e421-4d1a-8594-523e429188e6"

print(f"--- Re-assigning Data to Timothy ({correct_user_id}) ---")

# 1. Re-assign Apiaries
apiaries = db_select("apiaries", filters={"user_id": wrong_user_id})
print(f"Found {len(apiaries)} apiaries to re-assign.")
for a in apiaries:
    res = db_update("apiaries", {"user_id": correct_user_id}, {"id": a['id']})
    if res.get('success'):
        print(f"  Successfully re-assigned apiary: {a['name']}")
    else:
        print(f"  Failed to re-assign apiary {a['name']}: {res.get('error')}")

# 2. Re-assign Hives
hives = db_select("hives", filters={"user_id": wrong_user_id}, limit=1000)
print(f"Found {len(hives)} hives to re-assign.")
if hives:
    # Use id list for bulk update if possible, otherwise iterate
    for h in hives:
         db_update("hives", {"user_id": correct_user_id}, {"id": h['id']})
    print(f"  Hives re-assignment complete.")

# 3. Re-assign Farmers
farmers = db_select("farmers", filters={"user_id": wrong_user_id})
print(f"Found {len(farmers)} farmers to re-assign.")
for f in farmers:
    db_update("farmers", {"user_id": correct_user_id}, {"id": f['id']})
    print(f"  Re-assigned farmer: {f['name']}")

print("\n--- Verification Audit ---")
api_check = db_select("apiaries", filters={"user_id": correct_user_id})
hive_check = db_select("hives", filters={"user_id": correct_user_id}, limit=1000)
print(f"Timothy now owns {len(api_check)} apiaries and {len(hive_check)} hives.")
