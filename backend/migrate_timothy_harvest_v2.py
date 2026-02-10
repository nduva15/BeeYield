import os, sys
sys.path.append(os.getcwd())
from app.db.supabase_db import db_select, db_insert

def migrate():
    user_id = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6'
    apiaries = db_select('apiaries', filters={'name': 'Kibwezi Main Apiary'})
    if not apiaries:
        print("Kibwezi apiary not found")
        return
    apiary_id = apiaries[0]['id']
    
    hives = db_select('hives', filters={'apiary_id': apiary_id}, limit=1)
    if not hives:
        print("No hives found in Kibwezi")
        return
    hive_id = hives[0]['id']
    
    data = {
        'user_id': user_id,
        'hive_id': hive_id,
        'apiary_id': apiary_id,
        'quantity_kg': 60.0,
        'harvest_date': '2024-05-15',
        'honey_type': 'Polyfloral',
        'notes': 'Initial codebase harvest 2024',
        'batch_code': 'BY-2024-60KG',
        'is_verified': True
    }
    
    print(f"Inserting harvest data: {data}")
    res = db_insert('harvests', data)
    print(f"Full result: {res}")

if __name__ == "__main__":
    migrate()
