import os, sys
sys.path.append(os.getcwd())
from app.db.supabase_db import db_select, db_insert

def seed_hives():
    user_id = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6'
    apiaries = db_select('apiaries', filters={'user_id': user_id})
    if not apiaries:
        print("No apiary found for Timothy.")
        return
    
    apiary_id = apiaries[0]['id']
    print(f"Adding 184 hives to apiary {apiary_id} for user {user_id}")
    
    # Check existing hives
    existing = db_select('hives', filters={'apiary_id': apiary_id}, limit=500)
    if len(existing) >= 184:
        print(f"Already have {len(existing)} hives. Skipping.")
        return
    
    hives_to_insert = []
    start_index = len(existing) + 1
    for i in range(start_index, 185):
        hives_to_insert.append({
            'hive_code': f'KIB-H{i:03d}',
            'apiary_id': apiary_id,
            'user_id': user_id,
            'status': 'ACTIVE',
            'health_status': 'Good'
        })
    
    # Insert in batches
    batch_size = 50
    for i in range(0, len(hives_to_insert), batch_size):
        batch = hives_to_insert[i:i+batch_size]
        res = db_insert('hives', batch)
        print(f"Inserted batch {i//batch_size + 1}: {len(batch)} hives. Success: {res.get('success')}")

if __name__ == "__main__":
    seed_hives()
