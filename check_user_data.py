import sys
import os
sys.path.append(os.path.dirname(__file__))

from backend.app.db.supabase_db import db_select
import json

print("=" * 60)
print("CHECKING USER DATA")
print("=" * 60)

# Get all apiaries with user_id
apiaries = db_select("apiaries", limit=100)
print(f"\n📍 Total Apiaries: {len(apiaries)}")

# Group by user_id
user_apiaries = {}
for apiary in apiaries:
    user_id = apiary.get('user_id', 'NO_USER_ID')
    if user_id not in user_apiaries:
        user_apiaries[user_id] = []
    user_apiaries[user_id].append(apiary)

for user_id, user_aps in user_apiaries.items():
    print(f"\n👤 User ID: {user_id}")
    for ap in user_aps:
        print(f"   - {ap.get('name')} (ID: {ap.get('id')})")
        # Count hives for this apiary
        hives = db_select("hives", filters={"apiary_id": ap.get('id')})
        print(f"     Hives: {len(hives)}")

# Get all hives
print("\n" + "=" * 60)
print("HIVE SUMMARY")
print("=" * 60)
all_hives = db_select("hives", limit=500)
print(f"Total Hives: {len(all_hives)}")

# Group by user_id
user_hives = {}
for hive in all_hives:
    user_id = hive.get('user_id', 'NO_USER_ID')
    if user_id not in user_hives:
        user_hives[user_id] = 0
    user_hives[user_id] += 1

for user_id, count in user_hives.items():
    print(f"👤 User {user_id}: {count} hives")
