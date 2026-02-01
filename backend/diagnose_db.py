import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import get_supabase_admin, db_select
from dotenv import load_dotenv

load_dotenv()

def diagnose():
    supabase = get_supabase_admin()
    if not supabase:
        print("Failed to get Supabase admin client")
        return

    print("Checking products table...")
    try:
        # Try to get one product to see columns
        res = supabase.table("products").select("*").limit(1).execute()
        print(f"Select * result data: {res.data}")
        if res.data:
            print(f"Actual columns in DB: {list(res.data[0].keys())}")
        else:
            print("Table is empty, trying to describe via a failed insert...")
            # Try to insert a tiny object to see what columns are mandated
            try:
                fail_res = supabase.table("products").insert({"invalid_column": "value"}).execute()
            except Exception as e:
                print(f"Caught expected error on bad insert: {e}")

            # Try to insert a minimal valid object (if name/category are required)
            try:
                test_item = {"name": "Test Diagnostic", "category": "honey"}
                success_res = supabase.table("products").insert(test_item).execute()
                print(f"Minimal insert success! Data: {success_res.data}")
                if success_res.data:
                    print(f"Actual columns (from fresh insert): {list(success_res.data[0].keys())}")
                    # Cleanup
                    supabase.table("products").delete().eq("id", success_res.data[0]["id"]).execute()
            except Exception as e:
                print(f"Minimal insert failed: {e}")

    except Exception as e:
        print(f"Diagnosis failed: {e}")

if __name__ == "__main__":
    diagnose()
