
import os
import sys
# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.db.supabase_db import db_select
from app.core.config import settings

def check_data():
    with open("db_manual_check.txt", "w", encoding="utf-8") as f:
        f.write(f"Connecting to: {settings.SUPABASE_URL}\n")
        
        apiaries = db_select("apiaries")
        uids = set()
        for a in apiaries:
            uids.add(a.get('user_id'))
        
        hives = db_select("hives")
        for h in hives:
            uids.add(h.get('user_id'))
            
        f.write(f"Unique UserIDs found in data: {uids}\n")

        f.write("\n--- APIARIES ---\n")
        if not apiaries:
            f.write("No apiaries found.\n")
        else:
            for a in apiaries:
                f.write(f"Apiary: {a.get('name')} | ID: {a.get('id')} | UserID: {a.get('user_id')} | Status: {a.get('status')}\n")

        f.write("\n--- HIVES ---\n")
        if not hives:
            f.write("No hives found.\n")
        else:
            for h in hives:
                f.write(f"Hive: {h.get('hive_code')} | ID: {h.get('id')} | ApiaryID: {h.get('apiary_id')} | UserID: {h.get('user_id')}\n")
    print("Check complete. See db_manual_check.txt")

if __name__ == "__main__":
    check_data()
