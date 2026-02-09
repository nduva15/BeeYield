"""
HoneyChain Traceability Migration Script
Distributes 943kg (883 historical + 60 current) across hives with batch-level traceability.
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.db.supabase_db import db_select, db_insert, get_client, get_admin_headers, get_supabase_admin

def migrate_honeychain():
    print("🚀 Starting HoneyChain Traceability Migration...")
    
    client = get_client()
    headers = get_admin_headers()
    admin = get_supabase_admin()
    
    # 1. FIND TIMOTHY via direct database query
    email = 'timothynduva349@gmail.com'
    
    # Use the admin client to list users
    try:
        users_response = admin.auth.admin.list_users()
        timothy = next((u for u in users_response if u.email == email), None)
        
        if not timothy:
            print(f"❌ Error: User {email} not found.")
            return
        
        user_id = timothy.id
        print(f"✅ Found Timothy: {user_id}")
    except Exception as e:
        print(f"❌ Error finding user: {e}")
        # Fallback: hardcode known user ID if needed
        user_id = "10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6"
        print(f"⚠️ Using fallback user_id: {user_id}")
    
    # 2. FIND APIARY "Kibwezi Main Apiary"
    apiary_name = "Kibwezi Main Apiary"
    apiaries = db_select('apiaries', filters={'name': f'eq.{apiary_name}', 'user_id': f'eq.{user_id}'})
    
    if not apiaries:
        print(f"❌ Error: Apiary '{apiary_name}' not found for user.")
        return
    
    apiary_id = apiaries[0]['id']
    print(f"✅ Found Apiary: {apiary_name} ({apiary_id})")

    # 3. RESET DATA - Delete existing harvests and hives
    print("🧹 Cleaning up old hives and harvests...")
    
    # Delete harvests first (FK constraint)
    resp = client.delete(f'/harvests?user_id=eq.{user_id}', headers=headers)
    print(f"  Deleted harvests: {resp.status_code}")
    
    # Delete hives
    resp = client.delete(f'/hives?user_id=eq.{user_id}', headers=headers)
    print(f"  Deleted hives: {resp.status_code}")
    
    # 4. CREATE 184 HIVES
    hive_ids = []
    print("📦 Creating 184 hives...")
    
    for i in range(1, 185):
        hive_code = f"KIB-H{i:03d}"
        has_colony = (i <= 88)  # First 88 have active colonies
        
        hive_data = {
            "user_id": user_id,
            "apiary_id": apiary_id,
            "hive_code": hive_code,
            "status": "ACTIVE",
            "health_status": "Good",
            "has_colony": has_colony
        }
        
        resp = client.post('/hives', json=hive_data, headers=headers)
        if resp.status_code in [200, 201]:
            data = resp.json()
            hive_id = data[0]['id'] if isinstance(data, list) else data.get('id')
            if hive_id:
                hive_ids.append(hive_id)
        
        if i % 50 == 0:
            print(f"  Created {i}/184 hives...")

    print(f"✅ Created {len(hive_ids)} hives. First 88 marked with active colonies.")

    if len(hive_ids) < 88:
        print("❌ Error: Not enough hives created. Aborting.")
        return

    # 5. HISTORICAL HARVEST DISTRIBUTION (2020-2025)
    historical_config = [
        {"year": 2020, "kg": 86, "hives": 4},
        {"year": 2021, "kg": 87, "hives": 20},
        {"year": 2022, "kg": 55, "hives": 45},
        {"year": 2023, "kg": 105, "hives": 88},
        {"year": 2024, "kg": 250, "hives": 88},
        {"year": 2025, "kg": 300, "hives": 88},
    ]

    print("📊 Distributing historical harvests (2020-2025)...")
    
    for config in historical_config:
        year = config['year']
        total_kg = config['kg']
        hives_involved = min(config['hives'], len(hive_ids))
        
        seasons = [
            {"date": f"{year}-06-15", "desc": "Summer Harvest", "type": "Wildflower"},
            {"date": f"{year}-12-15", "desc": "Winter Harvest", "type": "Forest"}
        ]
        
        kg_per_entry = (total_kg / 2) / hives_involved
        
        for season in seasons:
            batch_base = f"HB-{year}-{season['date'][5:7]}{season['date'][8:10]}"
            
            for i in range(hives_involved):
                h_id = hive_ids[i]
                unique_batch_id = f"{batch_base}-{i+1:03d}"
                
                harvest_data = {
                    "user_id": user_id,
                    "apiary_id": apiary_id,
                    "hive_id": h_id,
                    "batch_code": unique_batch_id,
                    "quantity_kg": round(kg_per_entry, 2),
                    "harvest_date": season['date'],
                    "honey_type": season['type'],
                    "notes": f"Historical Sync - {season['desc']} {year}",
                    "is_verified": True,
                    "trace_link": f"https://honeychain.beeyield.com/trace/{unique_batch_id}"
                }
                
                client.post('/harvests', json=harvest_data, headers=headers)
        
        print(f"  📅 Year {year}: {total_kg}kg distributed across {hives_involved} hives")

    # 6. 2026 HARVEST (Jan 3-10, 60kg)
    print("🍯 Distributing 2026 daily harvest (Jan 3-10)...")
    
    daily_kg = 60 / 8  # 7.5kg per day
    kg_per_hive_day = daily_kg / 30  # 0.25kg per hive per day
    
    for day in range(3, 11):
        harvest_date = f"2026-01-{day:02d}"
        batch_base = f"HB-2026-01{day:02d}"
        
        for i in range(30):
            h_id = hive_ids[i]
            unique_batch_id = f"{batch_base}-{i+1:03d}"
            
            harvest_data = {
                "user_id": user_id,
                "apiary_id": apiary_id,
                "hive_id": h_id,
                "batch_code": unique_batch_id,
                "quantity_kg": round(kg_per_hive_day, 2),
                "harvest_date": harvest_date,
                "honey_type": "Early Spring",
                "notes": f"Daily Traceability Log - {harvest_date}",
                "is_verified": True,
                "trace_link": f"https://honeychain.beeyield.com/trace/{unique_batch_id}"
            }
            
            client.post('/harvests', json=harvest_data, headers=headers)
    
    print("✅ 2026 migration complete (240 entries)")
    
    # 7. VERIFY
    harvests = db_select('harvests', filters={'user_id': f'eq.{user_id}'}, limit=1000)
    hives = db_select('hives', filters={'user_id': f'eq.{user_id}'}, limit=200)
    
    total_kg = sum(h.get('quantity_kg', 0) for h in harvests)
    
    print("\n" + "="*50)
    print("✨ HONEYCHAIN TRACEABILITY MIGRATION COMPLETE!")
    print("="*50)
    print(f"  📦 Hives Created: {len(hives)}")
    print(f"  📊 Harvest Records: {len(harvests)}")
    print(f"  🍯 Total Honey: {total_kg:.2f} kg")
    print("="*50)

if __name__ == "__main__":
    migrate_honeychain()
