import os, sys
sys.path.append(os.getcwd())
from app.db.supabase_db import db_select, db_insert

def migrate():
    # Timothy's UUID as found
    user_id = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6'
    
    # Find his apiaries and hives
    hives = db_select('hives', filters={'user_id': user_id}, limit=1)
    if not hives:
        print("No hives found for user Timothy. Searching by apiary name...")
        apiaries = db_select('apiaries', filters={'name': 'Kibwezi Main Apiary'})
        if apiaries:
            apiary_id = apiaries[0]['id']
            hives = db_select('hives', filters={'apiary_id': apiary_id}, limit=1)
            if not hives:
                print("Apiary found but no hives inside.")
                return
            hive = hives[0]
        else:
            print("No apiary found either.")
            return
    else:
        hive = hives[0]
        apiary_id = hive.get('apiary_id')

    print(f"Using Hive ID: {hive['id']} and Apiary ID: {apiary_id}")

    data = {
        'user_id': user_id,
        'hive_id': hive['id'],
        'apiary_id': apiary_id,
        'quantity_kg': 60.0,
        'harvest_date': '2024-05-15',
        'honey_type': 'Polyfloral',
        'notes': 'Initial codebase harvest 2024',
        'batch_code': 'BY-2024-60KG',
        'is_verified': True
    }
    
    # Check if exists
    existing = db_select('harvests', filters={'batch_code': 'BY-2024-60KG'})
    if existing:
        print("Harvest already exists")
    else:
        res = db_insert('harvests', data)
        print(f"Migration result: {res}")

if __name__ == "__main__":
    migrate()
