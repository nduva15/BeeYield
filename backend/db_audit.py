
from app.db.supabase_db import db_select

user_id = "10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6"

print(f"--- Database Audit for Timothy (user_id: {user_id}) ---")

# 1. Check Apiaries
print("\n[Apiaries]")
apiaries = db_select("apiaries", filters={"user_id": user_id})
for a in apiaries:
    print(f"  - {a.get('name')} (ID: {a.get('id')})")
print(f"Total: {len(apiaries)}")

# 2. Check Hives
print("\n[Hives]")
hives = db_select("hives", filters={"user_id": user_id}, limit=1000)
for h in hives[:5]:
    print(f"  - {h.get('hive_code')} (ID: {h.get('id')})")
if len(hives) > 5:
    print(f"  ... and {len(hives)-5} more")
print(f"Total: {len(hives)}")

# 3. Check Farmers
print("\n[Farmers]")
farmers = db_select("farmers", filters={"user_id": user_id})
for f in farmers:
    print(f"  - {f.get('name')} (ID: {f.get('id')})")
print(f"Total: {len(farmers)}")

# 4. Check all apiaries (to see if they belong to someone else)
print("\n[Global Apiaries Search]")
all_apiaries = db_select("apiaries")
for a in all_apiaries:
    print(f"  - {a.get('name')} (ID: {a.get('id')}) -> Owner: {a.get('user_id')}")
