
import os
import sys
# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.db.supabase_db import db_select
from app.core.config import settings

def check_data():
    print(f"Connecting to: {settings.SUPABASE_URL}")
    
    print("\n--- ALL USERS (from apiaries/hives) ---")
    apiaries = db_select("apiaries")
    uids = set()
    for a in apiaries:
        uids.add(a.get('user_id'))
    
    hives = db_select("hives")
    for h in hives:
        uids.add(h.get('user_id'))
        
    print(f"Unique UserIDs found in data: {uids}")

    print("\n--- APIARIES ---")
    if not apiaries:
        print("No apiaries found.")
    else:
        for a in apiaries:
            print(f"Apiary: {a.get('name')} | ID: {a.get('id')} | UserID: {a.get('user_id')} | Status: {a.get('status')}")

    print("\n--- HIVES ---")
    if not hives:
        print("No hives found.")
    else:
        for h in hives:
            print(f"Hive: {h.get('hive_code')} | ID: {h.get('id')} | ApiaryID: {h.get('apiary_id')} | UserID: {h.get('user_id')}")

if __name__ == "__main__":
    check_data()
