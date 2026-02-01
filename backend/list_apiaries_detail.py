import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_select

def list_apiaries():
    apiaries = db_select("apiaries")
    for a in apiaries:
        print(f"ID: {a['id']}, Name: {a['name']}, Code: {a.get('apiary_code')}, Hives count in field: {a.get('hive_count')}")
        hives = db_select("hives", filters={"apiary_id": a['id']}, limit=1000)
        print(f"   Actual Hive rows: {len(hives)}")

if __name__ == "__main__":
    list_apiaries()
