
import os
from app.db.supabase_db import db_select

def check_data():
    print("--- CHECKING APIARIES ---")
    apiaries = db_select("apiaries")
    if not apiaries:
        print("No apiaries found.")
    else:
        print(f"Found {len(apiaries)} apiaries.")
        for a in apiaries:
            print(f"ID: {a.get('id')}, Name: {a.get('name')}, Status: {a.get('status')}, UserID: {a.get('user_id')}")

    print("\n--- CHECKING HIVES ---")
    hives = db_select("hives")
    if not hives:
        print("No hives found.")
    else:
        print(f"Found {len(hives)} hives.")
        for h in hives:
            print(f"ID: {h.get('id')}, Code: {h.get('hive_code')}, ApiaryID: {h.get('apiary_id')}, Status: {h.get('status')}")

if __name__ == "__main__":
    check_data()
