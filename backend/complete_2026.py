"""
HoneyChain 2026 Completion Script
Fills in missing 2026 harvest entries
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.db.supabase_db import db_select, get_client, get_admin_headers

def complete_2026():
    print("🍯 Completing 2026 harvest entries...")
    
    client = get_client()
    headers = get_admin_headers()
    user_id = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6'
    
    # Get correct apiary_id from existing harvests
    existing = db_select('harvests', filters={'user_id': f'eq.{user_id}'}, limit=1)
    if not existing:
        print("❌ No existing harvests found")
        return
    apiary_id = existing[0].get('apiary_id')
    print(f"Using apiary_id: {apiary_id}")
    
    # Get hive IDs
    hives = db_select('hives', filters={'user_id': f'eq.{user_id}'}, limit=200, order_by='hive_code')
    hive_ids = [h['id'] for h in hives]
    print(f"Found {len(hive_ids)} hives")

    # Get existing 2026 batch codes
    existing_2026 = db_select('harvests', filters={'user_id': f'eq.{user_id}', 'harvest_date': 'gte.2026-01-01'}, limit=500)
    existing_batches = set(h.get('batch_code') for h in existing_2026 if h.get('batch_code'))
    print(f"Existing 2026 batches: {len(existing_batches)}")

    kg = 60 / 8 / 30  # 0.25kg per hive per day
    added = 0

    for day in range(3, 11):
        harvest_date = f'2026-01-{day:02d}'
        for i in range(30):
            batch_id = f'HB-2026-01{day:02d}-{i+1:03d}'
            if batch_id in existing_batches:
                continue
                
            harvest_data = {
                'user_id': user_id,
                'apiary_id': apiary_id,
                'hive_id': hive_ids[i],
                'batch_code': batch_id,
                'quantity_kg': round(kg, 2),
                'harvest_date': harvest_date,
                'honey_type': 'Early Spring',
                'notes': f'Daily Traceability Log - {harvest_date}',
                'is_verified': True,
                'trace_link': f'https://honeychain.beeyield.com/trace/{batch_id}'
            }
            
            resp = client.post('/harvests', json=harvest_data, headers=headers)
            if resp.status_code in [200, 201]:
                added += 1
            
        if added > 0:
            print(f"  Jan {day}: +{added} entries")

    print(f"✅ Added {added} new entries")
    
    # Verify final counts
    final = db_select('harvests', filters={'user_id': f'eq.{user_id}'}, limit=2000)
    total_kg = sum(h.get('quantity_kg', 0) for h in final)
    print(f"📊 Total Harvests: {len(final)}")
    print(f"🍯 Total Honey: {total_kg:.2f} kg")

if __name__ == "__main__":
    complete_2026()
