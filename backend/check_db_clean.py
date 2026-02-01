
import os
from app.db.supabase_db import db_select

def check_data():
    print("--- APIARIES ---")
    apiaries = db_select("apiaries")
    for a in apiaries:
        print(f"Apiary: {a.get('name')} | ID: {a.get('id')} | UserID: {a.get('user_id')}")

    print("\n--- HIVES ---")
    hives = db_select("hives")
    for h in hives:
        print(f"Hive: {h.get('hive_code')} | ID: {h.get('id')} | ApiaryID: {h.get('apiary_id')} | UserID: {h.get('user_id')}")

if __name__ == "__main__":
    check_data()
