import os
import sys
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import get_supabase

def check_raw_data():
    supabase = get_supabase()
    if not supabase:
        print("FAIL: No supabase connection")
        return

    tables = ["products", "honey_batches"]
    for t in tables:
        try:
            res = supabase.table(t).select("*").execute()
            print(f"Table '{t}' has {len(res.data)} rows.")
            if len(res.data) > 0:
                print(f"Sample: {json.dumps(res.data[0], indent=2)}")
        except Exception as e:
            print(f"Error reading {t}: {e}")

if __name__ == "__main__":
    check_raw_data()
