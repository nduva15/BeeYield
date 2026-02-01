
import os
import sys
# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.db.supabase_db import db_update, db_select

def fix_data():
    apiaries = db_select("apiaries")
    for a in apiaries:
        if a.get('status') != 'active':
            print(f"Updating apiary {a.get('name')} to active...")
            db_update("apiaries", {"status": "active"}, {"id": a.get('id')})
    
    print("Fix complete.")

if __name__ == "__main__":
    fix_data()
