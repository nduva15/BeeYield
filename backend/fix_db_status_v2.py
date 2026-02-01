
import os
import sys
# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.db.supabase_db import db_update, db_select

def fix_data():
    apiaries = db_select("apiaries")
    print(f"Found {len(apiaries)} apiaries.")
    for a in apiaries:
        print(f"Current apiary: {a.get('name')} | Status: {a.get('status')}")
        res = db_update("apiaries", {"status": "active"}, {"id": a.get('id')})
        print(f"Update result: {res}")
    
    # Re-verify
    updated = db_select("apiaries")
    for a in updated:
        print(f"Verified apiary: {a.get('name')} | Status: {a.get('status')}")

if __name__ == "__main__":
    fix_data()
